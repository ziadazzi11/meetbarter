
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
import { MessagesService } from './messages.service';
import { JwtService } from '@nestjs/jwt';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { AnomalyDetectionService } from '../security/anomaly-detection.service';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
    cors: {
        origin: '*', // Allow all origins for MVP
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('ChatGateway');

    constructor(
        private readonly messagesService: MessagesService,
        private readonly jwtService: JwtService,
        private readonly notificationsGateway: NotificationsGateway,
        private readonly anomalyDetection: AnomalyDetectionService,
        private readonly prisma: PrismaService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            // 1. WebSocket Authentication (Layer VI)
            const token = client.handshake.auth.token || client.handshake.headers.authorization;
            if (!token) {
                this.logger.warn(`Connection Rejected: No token provided [${client.id}]`);
                client.disconnect();
                return;
            }

            const cleanToken = token.replace('Bearer ', '');
            const payload = this.jwtService.verify(cleanToken);

            // 2. Behavioral Check
            const user = await (this.prisma.user as any).findUnique({ where: { id: payload.sub } });
            if (!user || user.isBanned) {
                client.disconnect();
                return;
            }

            if (user.riskScore > 70) {
                this.logger.error(`Connection Rejected: High Risk Score (${user.riskScore}) for User ${user.email}`);
                client.disconnect();
                return;
            }

            client.data.user = payload;
            this.logger.log(`Secure Connection Established: ${user.email} [${client.id}]`);
        } catch (e) {
            this.logger.error(`Handshake Failed: ${e.message}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    // Join a Trade Room (Layer IX: Containment)
    @SubscribeMessage('join_trade')
    async handleJoinTrade(@ConnectedSocket() client: Socket, @MessageBody() tradeId: string) {
        const user = client.data.user;
        if (!user) return;

        // Verify Authorization: User must be buyer or seller in the trade
        const trade = await this.prisma.trade.findUnique({ where: { id: tradeId } });
        if (!trade || (trade.buyerId !== user.sub && trade.sellerId !== user.sub)) {
            this.logger.warn(`Unauthorized Room Join Attempt: User ${user.email} -> trade_${tradeId}`);
            return { event: 'error', message: 'Unauthorized access' };
        }

        client.join(`trade_${tradeId}`);
        this.logger.log(`Authorized: ${user.email} joined trade_${tradeId}`);
        return { event: 'joined', tradeId };
    }

    // Handle Send Message
    @SubscribeMessage('send_message')
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { senderId: string; receiverId: string; tradeId: string; listingId: string; content?: string; templateKey?: string }
    ) {
        const start = Date.now();
        // 1. Persist to DB
        const message = await this.messagesService.sendMessage(payload);

        // 2. Emit to Room
        this.server.to(`trade_${payload.tradeId}`).emit('receive_message', message);

        // 3. Notify Recipient Globally (Real-Time Toast)
        this.notificationsGateway.sendNotification(payload.receiverId, 'NEW_MESSAGE', {
            tradeId: payload.tradeId,
            senderId: payload.senderId,
            content: payload.content || 'New attachment received'
        });

        this.logger.log(`Messages: Processed in ${Date.now() - start}ms`);
        return message;
    }

    // Handle Typing Indicator
    @SubscribeMessage('typing')
    handleTyping(@ConnectedSocket() client: Socket, @MessageBody() payload: { tradeId: string; isTyping: boolean; userId: string }) {
        client.to(`trade_${payload.tradeId}`).emit('user_typing', payload);
    }
}
