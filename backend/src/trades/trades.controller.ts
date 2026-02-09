import { Controller, Post, Get, Body, UseGuards, Request, Param } from '@nestjs/common';
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
    return this.tradesService.processTradeFee(id, req.user.userId);
  }

  @Get(':id')
  async getTrade(@Request() req, @Param('id') id: string) {
    // If param is 'start' (colliding with Post 'start'?), Nest match order matters.
    // 'start' is hardcoded path, ':id' is param. 'start' usually takes precedence if defined first.
    // We should be fine since 'start' is defined above.
    return this.tradesService.getTradeDetails(id, req.user.userId);
  }
}
