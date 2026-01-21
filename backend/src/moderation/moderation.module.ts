import { Module } from '@nestjs/common';
import { ContentModerationService } from './content-moderation.service';
import { ModerationController } from './moderation.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [PrismaModule, NotificationsModule],
    providers: [ContentModerationService],
    controllers: [ModerationController],
    exports: [ContentModerationService],
})
export class ModerationModule { }
