import { Controller, Post, Body, Get, Param, BadRequestException } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Post()
    async sendMessage(@Body() body: { senderId: string; receiverId: string; tradeId?: string; listingId: string; content?: string; templateKey?: string }) {
        if (!body.content && !body.templateKey) throw new BadRequestException("Message content or template required");
        return this.messagesService.sendMessage(body);
    }

    @Get('trade/:tradeId')
    async getTradeMessages(@Param('tradeId') tradeId: string) {
        return this.messagesService.getMessagesForTrade(tradeId);
    }
}
