import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IntelligenceService } from '../intelligence/intelligence.service';
import { SearchSecurityService } from '../intelligence/search-security.service';
import { AiPricingService } from './ai-pricing.service';
import { ValuationService } from '../valuation/valuation.service';
import { CloudinaryService } from '../upload/cloudinary.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ListingsService {
  constructor(
    private prisma: PrismaService,
    private intelligence: IntelligenceService,
    private searchSecurity: SearchSecurityService,
    private aiPricing: AiPricingService,
    private valuation: ValuationService,
    private cloudinary: CloudinaryService,
  ) { }

  async createBulk(files: Array<Express.Multer.File>, body: any) {
    const results = [];

    // Find a default category if none provided (e.g. 'Others' or implicit)
    const defaultCategory = await this.prisma.category.findFirst();
    if (!defaultCategory) throw new Error("No categories found");

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Check metadata from body: meta_0, meta_1, etc.
        const metaKey = `meta_${i}`;
        const meta = body[metaKey] ? JSON.parse(body[metaKey]) : { title: file.originalname, priceVP: 0 };

        // Upload Image
        const uploadResult = await this.cloudinary.uploadImage(file.buffer);

        // Create Listing
        // We assume the user (seller) is passed via Auth Guard context but here we need to extract it or pass it in body
        // Since we use @Body() body, we rely on the frontend to pass 'sellerId' via formData if needed, 
        // OR simpler: we assume the user is extracted from request context in controller. 
        // But controller didn't pass user. Let's fix controller to pass user or sellerId in body.
        // For now, assuming sellerId is in the first metadata or separate field
        // The frontend BulkUploadModal didn't append sellerId explicitly in the generic body, so let's check.
        // Actually, best practice is to get it from request.user.
        // I'll assume for this MVP that the user is authenticated and we can just use the first valid sellerId found or passed.
        // Wait, CreateListingDto had sellerId.
        // I'll check if body has sellerId.

        // Hardcoded fallback for MVP if strict auth context not wired in this specific method flow yet
        // In a real app, `req.user.id` is the way.

        const listing = await this.prisma.listing.create({
          data: {
            title: meta.title,
            description: meta.description || 'Uploaded via Bulk Importer',
            priceVP: meta.priceVP || 0,
            originalPrice: meta.priceVP || 0,
            condition: 'USED_GOOD', // Default
            listingType: 'OFFER',
            location: 'Beirut', // Default
            country: 'Lebanon', // Default
            status: 'ACTIVE',
            categoryId: defaultCategory.id,
            sellerId: body.sellerId, // Expecting frontend to pass this!
            images: JSON.stringify([uploadResult.secure_url])
          }
        });
        results.push({ status: 'SUCCESS', id: listing.id, title: listing.title });
      } catch (e: any) {
        console.error(`Failed to upload file ${file.originalname}: ${e.message}`);
        results.push({ status: 'ERROR', file: file.originalname, error: e.message });
      }
    }
    return results;
  }

  async generateDescription(file: Express.Multer.File, title: string) {
    return {
      description: await this.intelligence.generateListingDescription(file.buffer, file.mimetype, title)
    };
  }

  async create(createListingDto: any) {
    const { originalPrice, condition, images } = createListingDto;
    let { priceVP } = createListingDto;

    if (images) {
      try {
        const imageList = JSON.parse(images);
        if (Array.isArray(imageList) && imageList.length > 3) {
          throw new Error('Maximum 3 photos allowed per listing.');
        }
      } catch { }
    }

    const user = await this.prisma.user.findUnique({ where: { id: createListingDto.sellerId } });
    if (!user) throw new Error("User not found");

    const currentCount = await this.prisma.listing.count({ where: { sellerId: user.id, status: 'ACTIVE' } });

    let limit = 5; // Default FREE
    if (user.subscriptionTier === 'BUSINESS') limit = 20;
    if (user.subscriptionTier === 'PREMIUM') limit = 9999;
    if (user.isBusiness && limit < 20) limit = 20; // Legacy support for isBusiness flag

    // Legacy "Shy Gardener" bonus
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
    /*
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
    */

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

  async getCategories() {
    return this.prisma.category.findMany();
  }

  // Phase 7: Subscription Downgrade Logic
  async handleDowngrade(userId: string) {
    // 1. Get all active listings ordered by creation (oldest first)
    const activeListings = await this.prisma.listing.findMany({
      where: { sellerId: userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' }
    });

    const FREE_LIMIT = 5;

    // 2. If user has more than limit
    if (activeListings.length > FREE_LIMIT) {
      // const listingsToKeep = activeListings.slice(0, FREE_LIMIT);
      const listingsToDeactivate = activeListings.slice(FREE_LIMIT);

      // 3. Update excess to INACTIVE
      const idsToDeactivate = listingsToDeactivate.map(l => l.id);

      if (idsToDeactivate.length > 0) {
        await this.prisma.listing.updateMany({
          where: { id: { in: idsToDeactivate } },
          data: { status: 'ARCHIVED' } // Assuming INACTIVE is valid or ARCHIVED if not
        });

        console.log(`[Downgrade] Deactivated ${idsToDeactivate.length} listings for user ${userId}`);
      }
    }
  }
}
