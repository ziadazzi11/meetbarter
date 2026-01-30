import { Controller, Get, Post, Body, Param, Query, UseGuards, ServiceUnavailableException } from '@nestjs/common';
import { TradesService } from './trades.service';
import { SystemStateService } from '../system-state/system-state.service';
import { SystemFreezeGuard } from '../common/guards/system-freeze.guard';
import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

class CreateTradeDto {
  @IsString()
  listingId: string;

  @IsString()
  buyerId: string;

  @IsOptional()
  @IsNumber()
  cashOffer?: number;

  @IsOptional()
  @IsString()
  cashCurrency?: string;
}

class DisputeTradeDto {
  @IsString()
  reason: string;

  @IsString()
  userId: string;
}

class CashSweetenerDto {
  @IsString()
  userId: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

@Controller('trades')
export class TradesController {
  constructor(
    private readonly tradesService: TradesService,
    private readonly systemState: SystemStateService
  ) { }

  @Post()
  @UseGuards(SystemFreezeGuard)
  create(@Body() dto: CreateTradeDto) {
    if (this.systemState.getKillSwitches().disableTrades) {
      throw new ServiceUnavailableException('Trading is currently disabled.');
    }
    return this.tradesService.createTrade(
      dto.listingId,
      dto.buyerId,
      dto.cashOffer,
      dto.cashCurrency
    );
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

  @Post(':id/dispute')
  dispute(
    @Param('id') id: string,
    @Body() dto: DisputeTradeDto
  ) {
    return this.tradesService.disputeTrade(id, dto.reason, dto.userId);
  }

  @Post(':id/cash')
  addCash(
    @Param('id') id: string,
    @Body() dto: CashSweetenerDto
  ) {
    return this.tradesService.addCashSweetener(id, dto.userId, dto.amount, dto.currency || 'USD');
  }
}
