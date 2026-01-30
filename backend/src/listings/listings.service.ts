import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IntelligenceService } from '../intelligence/intelligence.service';
import { SearchSecurityService } from '../intelligence/search-security.service';
import { AiPricingService } from './ai-pricing.service';
import { ValuationService } from '../valuation/valuation.service';
import { ContentModerationService } from '../moderation/content-moderation.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ListingsService {
  constructor(
    private prisma: PrismaService,
    private intelligence: IntelligenceService,
    private searchSecurity: SearchSecurityService,
    private aiPricing: AiPricingService,
    private valuation: ValuationService,
    private moderation: ContentModerationService,
  ) { }

  async create(createListingDto: any) {
    let { priceVP, originalPrice, condition, images } = createListingDto;

    if (images) {
      try {
        const imageList = JSON.parse(images);
        if (Array.isArray(imageList) && imageList.length > 3) {
          throw new Error('Maximum 3 photos allowed per listing.');
        }
      } catch (e) { }
    }

    const user = await this.prisma.user.findUnique({ where: { id: createListingDto.sellerId } });
    if (!user) throw new Error("User not found");

    const currentCount = await this.prisma.listing.count({ where: { sellerId: user.id, status: 'ACTIVE' } });
    let limit = 5;
    if (user.isBusiness) limit = 20;
    if (user.subscriptionTier === 'PREMIUM') limit = 1000;

    if (user.communityVerificationStatus === 'VERIFIED') {
      if (user.communityRole === 'GARDENER') limit += 20;
      else limit += 5;
    }

    if (currentCount >= limit) {
      throw new Error(`Storage limit reached (${currentCount}/${limit}). Upgrade to add more items.`);
    }

    const category = await this.prisma.category.findUnique({ where: { id: createListingDto.categoryId } });
    if (!category) throw new Error("Invalid Category");

    if (originalPrice && condition) {
      const scarcityCoefficient = this.aiPricing.calculateScarcityCoefficient(createListingDto.country, category.name);
      priceVP = this.valuation.calculateVP({
        originType: createListingDto.originType || 'PERSONAL_GIFT',
        condition: condition.toUpperCase(),
        authenticityStatus: createListingDto.authenticityStatus || 'UNVERIFIED',
        isRefurbished: !!createListingDto.isRefurbished,
        originalPrice
      }, scarcityCoefficient);
    }

    // --- ETHICAL MODERATION SCAN ---
    const moderationResult = await this.moderation.scanListing(
      createListingDto.title,
      createListingDto.description,
      createListingDto.country || 'LB',
    );

    if (!moderationResult.isAllowed) {
      // Record prohibited attempt (Insistence logic)
      const action = await this.moderation.recordProhibitedAttempt(
        createListingDto.sellerId,
        moderationResult.category!,
        moderationResult.reason!,
      );

      if (action === 'PERMANENT_BAN') {
        throw new Error("CRITICAL ETHICS VIOLATION: Your account has been permanently suspended due to repeated attempts to upload prohibited weaponry/military gear.");
      }

      throw new Error(`Item Blocked: This listing contains prohibited content (${moderationResult.category}). Repetitive violations will lead to permanent account suspension.`);
    }

    return this.prisma.listing.create({
      data: {
        ...createListingDto,
        priceVP: priceVP || 0,
      },
      include: {
        category: true,
        seller: { select: { id: true, fullName: true } }
      }
    });
  }

  async findAll(query?: any) {
    const { q, page = 1, limit = 10, categoryId, minPrice, maxPrice, location, country, sellerId, status, sortBy = 'createdAt', sortOrder = 'desc', userId, sessionId } = query;

    const sanitizedQuery = q ? this.searchSecurity.validateAndSanitize(q) : undefined;

    if (sanitizedQuery) {
      this.intelligence.logAnonymizedSearch(sanitizedQuery, location, country, sessionId || userId);
    }

    const where: any = {
      status: status || 'ACTIVE',
      ...(sanitizedQuery ? {
        OR: [
          { title: { contains: sanitizedQuery, mode: 'insensitive' } },
          { description: { contains: sanitizedQuery, mode: 'insensitive' } },
        ],
      } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(minPrice ? { priceVP: { gte: parseFloat(minPrice) } } : {}),
      ...(maxPrice ? { priceVP: { lte: parseFloat(maxPrice) } } : {}),
      ...(location ? { location: { contains: location, mode: 'insensitive' } } : {}),
      ...(country ? { country } : {}),
      ...(sellerId ? { sellerId } : {}),
    };

    const listings = await this.prisma.listing.findMany({
      where,
      take: parseInt(limit.toString()),
      skip: (parseInt(page.toString()) - 1) * parseInt(limit.toString()),
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            fullName: true,
            isBusiness: true,
            businessName: true,
            globalTrustScore: true,
            activityMetric: { select: { lastSeenAt: true, averageReplyHours: true } }
          }
        }
      }
    });

    return listings.map(l => ({
      ...l,
      seller: {
        ...l.seller,
        fullName: (l.seller.isBusiness && l.seller.businessName) ? l.seller.businessName : l.seller.fullName
      }
    }));
  }

  async findOne(id: string) {
    return this.prisma.listing.findUnique({
      where: { id },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            fullName: true,
            isBusiness: true,
            businessName: true,
            globalTrustScore: true,
            activityMetric: { select: { lastSeenAt: true, averageReplyHours: true } }
          }
        }
      }
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async archiveExpiredListings() {
    const now = new Date();
    const result = await this.prisma.listing.updateMany({
      where: { status: 'ACTIVE', expiresAt: { lte: now } },
      data: { status: 'ARCHIVED' }
    });
    if (result.count > 0) {
      console.log(`[Auto-Archive] Archived ${result.count} listings at ${now.toISOString()}`);
    }
  }

  async update(id: string, updateListingDto: any) {
    return this.prisma.listing.update({
      where: { id },
      data: updateListingDto,
    });
  }

  async remove(id: string) {
    return this.prisma.listing.delete({ where: { id } });
  }
}
