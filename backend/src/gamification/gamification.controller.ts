import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('gamification')
export class GamificationController {
    constructor(private readonly gamificationService: GamificationService) { }

    @UseGuards(JwtAuthGuard)
    @Post('claim-drop')
    async claimDrop(@Request() req, @Body() body: { qrHash: string; location?: string }) {
        return this.gamificationService.claimGeoDrop(req.user.userId, body.qrHash, body.location);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post('create-drop')
    async createDrop(@Body() body: {
        name: string;
        description?: string;
        location: string;
        rewardVP: number;
        maxClaims?: number;
        expiresAt?: string; // ISO Date String
        communityEventId?: string;
    }) {
        const expiresDate = body.expiresAt ? new Date(body.expiresAt) : undefined;
        return this.gamificationService.createGeoDrop({
            ...body,
            expiresAt: expiresDate
        });
    }

    @UseGuards(JwtAuthGuard)
    @Post('check-in')
    async checkIn(@Request() req) {
        return this.gamificationService.checkIn(req.user.userId);
    }

    @Get('leaderboard')
    async getLeaderboard() {
        return this.gamificationService.getTopTraders(10);
    }
}
