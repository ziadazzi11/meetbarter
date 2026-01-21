import {
    Injectable,
    CanActivate,
    ExecutionContext,
    BadRequestException,
} from '@nestjs/common';
import { ContentModerationService } from '../../moderation/content-moderation.service';
import { MODERATION_SEVERITY } from '../../config/prohibited-items.config';

@Injectable()
export class ContentModerationGuard implements CanActivate {
    constructor(private moderationService: ContentModerationService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { title, description, country } = request.body;

        if (!title || !description) {
            return true; // Skip if no content to check
        }

        const result = await this.moderationService.scanListing(
            title,
            description,
            country || 'Lebanon',
        );

        if (!result.isAllowed) {
            // Block immediately if prohibited
            throw new BadRequestException({
                message: 'Listing contains prohibited content',
                reason: result.reason,
                category: result.category,
                severity: result.severity,
            });
        }

        return true;
    }
}
