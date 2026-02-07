import { Controller, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { TradesService } from './trades.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('trades')
@UseGuards(JwtAuthGuard)
export class TradesController {
  constructor(private readonly tradesService: TradesService) { }

  @Post('start')
  async startTrade(@Request() req, @Body() body: { listingId: string; offerVP: number }) {
    return this.tradesService.initiateTrade(req.user.userId, body.listingId, body.offerVP);
  }

  @Post(':id/pay')
  async payTradeFee(@Request() req, @Param('id') id: string) {
    // Extract trade ID from URL param (handled by NestJS params usually, but using decorator here)
    // Wait, @Request() params is wrong. Need @Param('id')
    return this.tradesService.processTradeFee(id, req.user.userId);
  }
}
