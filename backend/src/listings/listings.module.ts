import { Module } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { AiPricingService } from './ai-pricing.service';
import { CategoriesModule } from '../categories/categories.module';
import { IntelligenceModule } from '../intelligence/intelligence.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ValuationModule } from '../valuation/valuation.module';
import { ModerationModule } from '../moderation/moderation.module';

@Module({
  imports: [PrismaModule, CategoriesModule, IntelligenceModule, ValuationModule, ModerationModule],
  controllers: [ListingsController],
  providers: [ListingsService, AiPricingService],
  exports: [AiPricingService],
})
export class ListingsModule { }
