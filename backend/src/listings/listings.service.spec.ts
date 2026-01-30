import { Test, TestingModule } from '@nestjs/testing';
import { ListingsService } from './listings.service';
import { PrismaService } from '../prisma/prisma.service';
import { IntelligenceService } from '../intelligence/intelligence.service';
import { SearchSecurityService } from '../intelligence/search-security.service';
import { AiPricingService } from './ai-pricing.service';
import { ValuationService } from '../valuation/valuation.service';
import { ContentModerationService } from '../moderation/content-moderation.service';

describe('ListingsService', () => {
  let service: ListingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingsService,
        { provide: PrismaService, useValue: { listing: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() } } },
        { provide: IntelligenceService, useValue: {} },
        { provide: SearchSecurityService, useValue: {} },
        { provide: AiPricingService, useValue: {} },
        { provide: ValuationService, useValue: {} },
        { provide: ContentModerationService, useValue: {} },
      ],
    }).compile();

    service = module.get<ListingsService>(ListingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
