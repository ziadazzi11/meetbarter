import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ContributionsService } from './contributions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('contributions')
export class ContributionsController {
    constructor(private readonly contributionsService: ContributionsService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Request() req, @Body() body: { tradeId?: string, amount: number, currency: string, message?: string, isPublic: boolean }) {
        return this.contributionsService.createContribution(req.user.userId, body);
    }

    @UseGuards(JwtAuthGuard)
    @Get('my')
    async getMyContributions(@Request() req) {
        return this.contributionsService.getUserContributions(req.user.userId);
    }
}
