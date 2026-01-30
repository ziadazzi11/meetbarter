import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SecurityModule } from '../security/security.module';

@Module({
    imports: [PrismaModule, AuthModule, SecurityModule],
    providers: [EmailService, NotificationsGateway],
    exports: [EmailService, NotificationsGateway],
})
export class NotificationsModule { }
