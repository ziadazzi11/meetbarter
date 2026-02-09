import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ContentModerationService } from './content-moderation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../security/security.types';

@Controller('moderation')
export class ModerationController {
    constructor(private moderationService: ContentModerationService) { }

    /**
     * User reports a listing
     */
    @Post('report')
    @UseGuards(JwtAuthGuard)
    async reportListing(
        @Request() req,
        @Body()
        data: {
            listingId: string;
            reason: string;
            category: string;
        },
    ) {
        const flag = await this.moderationService.createFlag({
            listingId: data.listingId,
            reason: data.reason,
            category: data.category,
            severity: 'MEDIUM_RISK',
            reportedByUserId: req.user.userId,
        });

        // Set listing to pending review
        await this.moderationService.setPendingReview(data.listingId);

        return {
            message: 'Report submitted successfully',
            flagId: flag.id,
        };
    }

    /**
     * Admin: Get all pending flags
     */
    @Get('flags/pending')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.FLAG_CONTENT)
    async getPendingFlags() {
        return this.moderationService.getPendingFlags();
    }

    /**
     * Admin: Approve a flag
     */
    @Post('flags/:id/approve')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.FLAG_CONTENT)
    async approveFlag(
        @Request() req,
        @Param('id') flagId: string,
        @Body() data: { notes?: string },
    ) {
        await this.moderationService.approveFlag(
            flagId,
            req.user.userId,
            data.notes,
        );

        return { message: 'Flag approved, listing reactivated' };
    }

    /**
     * Admin: Reject a flag
     */
    @Post('flags/:id/reject')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.FLAG_CONTENT)
    async rejectFlag(
        @Request() req,
        @Param('id') flagId: string,
        @Body() data: { notes?: string },
    ) {
        await this.moderationService.rejectFlag(
            flagId,
            req.user.userId,
            data.notes,
        );

        return { message: 'Flag rejected, listing remains inactive' };
    }

    /**
     * Admin: Ban a user
     */
    @Post('users/:id/ban')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.BAN_USER)
    async banUser(
        @Param('id') userId: string,
        @Body() data: { reason: string },
    ) {
        await this.moderationService.banUser(userId, data.reason);

        return { message: 'User banned successfully' };
    }
}
