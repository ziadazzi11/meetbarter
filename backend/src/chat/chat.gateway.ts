import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*', // Allow all origins for MVP. Production should restrict this.
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('ChatGateway');

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
        // TODO: Verify JWT token here for authentication
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('sendMessage')
    handleMessage(
        @MessageBody() payload: { sender: string; message: string; roomId?: string },
        @ConnectedSocket() client: Socket,
    ): void {
        this.logger.log(`Received message from ${client.id}: ${JSON.stringify(payload)}`);

        // Broadcast to all clients (Global Chat MVP)
        // In future: this.server.to(payload.roomId).emit('receiveMessage', payload);
        this.server.emit('receiveMessage', {
            ...payload,
            timestamp: new Date(),
            clientId: client.id
        });
    }
}
