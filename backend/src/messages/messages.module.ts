import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';
import { NotificationsModule } from '../notifications/notifications.module';
import { SecurityModule } from '../security/security.module';

@Module({
    imports: [
        PrismaModule,
        NotificationsModule,
        SecurityModule,
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '60m' },
        }),
    ],
    providers: [MessagesService, ChatGateway],
    controllers: [MessagesController],
})
export class MessagesModule { }
