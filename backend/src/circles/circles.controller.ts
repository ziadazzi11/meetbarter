import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CirclesService } from './circles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('circles')
@UseGuards(JwtAuthGuard)
export class CirclesController {
    constructor(private circlesService: CirclesService) { }

    @Post()
    async createCircle(
        @Request() req: any,
        @Body('name') name: string,
        @Body('description') description: string,
        @Body('isPublic') isPublic: boolean
    ) {
        return this.circlesService.createCircle(req.user.userId, name, description, isPublic);
    }

    @Get()
    async getCircles(@Request() req: any) {
        return this.circlesService.getCircles(req.user?.userId);
    }

    @Get(':id')
    async getCircleById(
        @Param('id') id: string,
        @Request() req: any
    ) {
        return this.circlesService.getCircleById(id, req.user?.userId);
    }

    @Post(':id/join')
    async joinCircle(
        @Param('id') circleId: string,
        @Request() req: any
    ) {
        return this.circlesService.joinCircle(req.user.userId, circleId);
    }

    @Post(':id/leave')
    async leaveCircle(
        @Param('id') circleId: string,
        @Request() req: any
    ) {
        return this.circlesService.leaveCircle(req.user.userId, circleId);
    }

    @Get(':id/listings')
    async getCircleListings(
        @Param('id') circleId: string,
        @Request() req: any
    ) {
        return this.circlesService.getCircleListings(circleId, req.user?.userId);
    }
}
