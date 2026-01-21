import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiPricingService } from './ai-pricing.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ListingsService {
  constructor(
    private prisma: PrismaService,
    private aiPricing: AiPricingService,
  ) { }

  // ... (existing methods)

  @Cron(CronExpression.EVERY_HOUR)
  async archiveExpiredListings() {
    const now = new Date();
    const result = await this.prisma.listing.updateMany({
      where: {
        status: 'ACTIVE',
        expiresAt: {
          lte: now
        }
      },
      data: {
        status: 'ARCHIVED'
      }
    });

    if (result.count > 0) {
      console.log(`[Auto-Archive] Archived ${result.count} expired listings at ${now.toISOString()}`);
    }
  }

  async create(createListingDto: any) {
    let { priceVP, originalPrice, condition, images } = createListingDto;

    // Phase 4: Enforce 3-photo limit
    if (images) {
      try {
        const imageList = JSON.parse(images);
        if (Array.isArray(imageList) && imageList.length > 3) {
          throw new Error('Maximum 3 photos allowed per listing.');
        }
      } catch (e) {
        // If not valid JSON, we might want to handle it or skip
      }
    }

    // Phase 14: Enforce Storage Limits (Tiers)
    const user = await this.prisma.user.findUnique({ where: { id: createListingDto.sellerId } });
    if (!user) throw new Error("User not found");

    const currentCount = await this.prisma.listing.count({ where: { sellerId: user.id, status: 'ACTIVE' } });

    let limit = 5; // Free Tier
    if (user.isBusiness) limit = 20; // Verified Business
    if (user.subscriptionTier === 'PREMIUM') limit = 1000; // Premium

    // Community Service Bonus
    // "Gardener's Special": Verified Gardeners get +20 listings. Others get +5.
    if (user.communityVerificationStatus === 'VERIFIED') {
      if (user.communityRole === 'GARDENER') {
        limit += 20;
      } else {
        limit += 5;
      }
    }

    if (currentCount >= limit) {
      throw new Error(`Storage limit reached (${currentCount}/${limit}). Upgrade to add more items.`);
    }

    // Phase 4: Enforce 3-photo limit

    // Fetch Category Name for AI Ops
    const category = await this.prisma.category.findUnique({ where: { id: createListingDto.categoryId } });
    if (!category) throw new Error("Invalid Category");

    // If originalPrice and condition are provided, override priceVP with AI suggested price
    if (originalPrice && condition) {
      // Phase 5: AI Market Intelligence (Now Category Aware)
      priceVP = this.aiPricing.calculatePrice(originalPrice, condition, createListingDto.country, category.name);
    }

    return this.prisma.listing.create({
      data: {
        ...createListingDto,
        priceVP: priceVP || 0,
      },
      include: {
        category: true,
        seller: {
          select: { id: true, fullName: true }
        }
      }
    });
  }
  // ... rest of file

  async findAll(location?: string, country?: string) {
    const where: any = { status: 'ACTIVE' };
    if (location) {
      where.location = { contains: location };
    }
    if (country) {
      where.country = country;
    }

    const listings = await this.prisma.listing.findMany({
      where,
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            fullName: true,
            isBusiness: true,
            businessName: true,
            businessVerificationStatus: true,
            globalTrustScore: true,
            activityMetric: {
              select: { lastSeenAt: true, averageReplyHours: true }
            }
          }
        }
      }
    });

    return listings.map(l => ({
      ...l,
      seller: {
        ...l.seller,
        // If legitimate business, show business name. Otherwise keep privacy or name.
        fullName: (l.seller.isBusiness && l.seller.businessName) ? l.seller.businessName : l.seller.fullName
      }
    }));
  }

  async findOne(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            fullName: true,
            isBusiness: true,
            businessName: true,
            businessVerificationStatus: true,
            globalTrustScore: true,
            activityMetric: {
              select: { lastSeenAt: true, averageReplyHours: true }
            }
          }
        }
      }
    });
    return listing;
  }

  update(id: number, updateListingDto: any) {
    return `This action updates a #${id} listing`;
  }

  remove(id: number) {
    return `This action removes a #${id} listing`;
  }
}
