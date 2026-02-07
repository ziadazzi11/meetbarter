import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Get()
    async findAll() {
        return this.eventsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.eventsService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() body: any, @Request() req) {
        return this.eventsService.createEvent({ ...body, organizerId: req.user.userId });
    }

    @Post(':id/join')
    @UseGuards(JwtAuthGuard)
    async join(@Param('id') id: string, @Body('listingId') listingId: string, @Request() req) {
        return this.eventsService.joinEvent(id, listingId, req.user.userId);
    }
}
