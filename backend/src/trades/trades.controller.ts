import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { TradesService } from './trades.service';
import { SystemFreezeGuard } from '../common/guards/system-freeze.guard';

@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) { }

  @Post()
  @UseGuards(SystemFreezeGuard)
  create(@Body() createTradeDto: any) {
    return this.tradesService.create(createTradeDto);
  }

  @Post(':id/confirm')
  confirm(@Param('id') id: string, @Body('userId') userId: string) {
    return this.tradesService.confirm(id, userId);
  }

  @Get()
  findAll(@Query('userId') userId: string) {
    return this.tradesService.findAll(userId);
  }

  @Get(':id')
  getTrade(@Param('id') id: string) {
    return this.tradesService.getTrade(id);
  }

  // v1.2: Soft Commitment
  @Post(':id/intent')
  recordIntent(@Param('id') tradeId: string, @Body('userId') userId: string) {
    return this.tradesService.recordSoftCommitment(tradeId, userId);
  }

  // v1.2: Pre-Trade Checklist
  @Post(':id/checklist')
  submitChecklist(
    @Param('id') tradeId: string,
    @Body('userId') userId: string,
    @Body('checklist') checklist: { timeAgreed: boolean; locationAgreed: boolean; conditionAgreed: boolean }
  ) {
    return this.tradesService.submitChecklist(tradeId, userId, checklist);
  }
}
