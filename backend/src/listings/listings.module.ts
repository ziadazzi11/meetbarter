import { Module } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { AiPricingService } from './ai-pricing.service';
import { ModerationModule } from '../moderation/moderation.module';

@Module({
  imports: [ModerationModule],
  controllers: [ListingsController],
  providers: [ListingsService, AiPricingService],
  exports: [AiPricingService],
})
export class ListingsModule { }
