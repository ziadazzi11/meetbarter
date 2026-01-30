
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AnomalyDetectionService } from '../security/anomaly-detection.service';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
    cors: {
        origin: '*', // Allow all origins for MVP
    },
    namespace: 'notifications'
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger('NotificationsGateway');

    constructor(
        private readonly jwtService: JwtService,
        private readonly anomalyDetection: AnomalyDetectionService,
        private readonly prisma: PrismaService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            // 1. WS Authentication
            const token = client.handshake.auth.token || client.handshake.headers.authorization;
            if (!token) {
                client.disconnect();
                return;
            }

            const cleanToken = token.replace('Bearer ', '');
            const payload = this.jwtService.verify(cleanToken);

            // 2. Behavioral Check
            const user = await (this.prisma.user as any).findUnique({ where: { id: payload.sub } });
            if (!user || user.isBanned || user.riskScore > 80) {
                client.disconnect();
                return;
            }

            client.data.user = payload;
            this.logger.log(`Secure Notifications Established: ${user.email} [${client.id}]`);
        } catch (e) {
            this.logger.error(`Notification Handshake Failed: ${e.message}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Notification Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join_user')
    handleJoinUser(@ConnectedSocket() client: Socket, @MessageBody() userId: string) {
        const user = client.data.user;
        if (!user || user.sub !== userId) {
            this.logger.warn(`Unauthorized Notification Room Join: ${user?.email} -> user_${userId}`);
            return { event: 'error', message: 'Forbidden' };
        }

        client.join(`user_${userId}`);
        this.logger.log(`Notifications: User joined room user_${userId}`);
        return { event: 'joined', userId };
    }

    @SubscribeMessage('join_admin')
    handleJoinAdmin(@ConnectedSocket() client: Socket) {
        const user = client.data.user;
        if (!user || user.role !== 'ADMIN') {
            this.logger.warn(`Unauthorized Admin Room Attempt: ${user?.email}`);
            return { event: 'error', message: 'Forbidden' };
        }

        client.join('admin_stats');
        this.logger.log(`Admin ${user.email} joined technical monitoring room`);
        return { event: 'joined', room: 'admin_stats' };
    }

    sendNotification(userId: string, type: string, payload: any) {
        this.server.to(`user_${userId}`).emit('notification', {
            type,
            payload,
            timestamp: new Date()
        });
        this.logger.log(`Notification sent to user_${userId}: ${type}`);
    }

    sendSystemStats(type: string, payload: any) {
        this.server.to('admin_stats').emit('system_stats', {
            type,
            payload,
            timestamp: new Date()
        });
    }
}
