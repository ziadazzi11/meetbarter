import { Controller, Post, Body, Get, Param, BadRequestException } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Post()
    @Post()
    async sendMessage(@Body() createMessageDto: CreateMessageDto) {
        if (!createMessageDto.content && !createMessageDto.templateKey) throw new BadRequestException("Message content or template required");
        return this.messagesService.sendMessage(createMessageDto);
    }

    @Get('trade/:tradeId')
    async getTradeMessages(@Param('tradeId') tradeId: string) {
        return this.messagesService.getMessagesForTrade(tradeId);
    }
}
