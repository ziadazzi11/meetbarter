import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CirclesService } from './circles.service';

@Controller('circles')
export class CirclesController {
    constructor(private circlesService: CirclesService) { }

    @Post()
    async createCircle(
        @Body('name') name: string,
        @Body('description') description: string,
        @Body('isPublic') isPublic: boolean,
        @Body('userId') userId: string // TODO: Replace with actual auth guard
    ) {
        return this.circlesService.createCircle(userId, name, description, isPublic);
    }

    @Get()
    async getCircles(@Request() req: any) {
        const userId = req.query.userId; // TODO: Get from auth
        return this.circlesService.getCircles(userId);
    }

    @Get(':id')
    async getCircleById(
        @Param('id') id: string,
        @Request() req: any
    ) {
        const userId = req.query.userId; // TODO: Get from auth
        return this.circlesService.getCircleById(id, userId);
    }

    @Post(':id/join')
    async joinCircle(
        @Param('id') circleId: string,
        @Body('userId') userId: string // TODO: Replace with actual auth
    ) {
        return this.circlesService.joinCircle(userId, circleId);
    }

    @Post(':id/leave')
    async leaveCircle(
        @Param('id') circleId: string,
        @Body('userId') userId: string // TODO: Replace with actual auth
    ) {
        return this.circlesService.leaveCircle(userId, circleId);
    }

    @Get(':id/listings')
    async getCircleListings(
        @Param('id') circleId: string,
        @Request() req: any
    ) {
        const userId = req.query.userId; // TODO: Get from auth
        return this.circlesService.getCircleListings(circleId, userId);
    }
}
