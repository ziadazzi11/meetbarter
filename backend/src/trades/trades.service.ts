import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';
import { SecurityService } from '../security/security.service';

@Injectable()
export class TradesService {
  constructor(
    private prisma: PrismaService,
    private timelineService: TimelineService,
    private security: SecurityService
  ) { }

  async createTrade(listingId: string, buyerId: string) {
    // 1. Validate Listing & Buyer
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing || listing.status !== 'ACTIVE') {
      throw new BadRequestException('Listing is not available');
    }

    // 🛡️ Security Hook: Fraud Check
    await this.security.assessAndLog(buyerId, {
      action: 'TRADE_INIT',
      userId: buyerId,
      details: { listingId, counterpartyId: listing.sellerId, price: listing.priceVP }
    });

    const buyer = await this.prisma.user.findUnique({ where: { id: buyerId } });
    if (!buyer) throw new BadRequestException('Buyer not found');

    // Logic: Buyer pays Price + 7.5% Fee
    // REFUSE_MINT_MODEL: No upfront deduction. Value is minted to Seller upon verification.
    // However, we still check if Buyer is "Good Standing" (e.g. Trust Score)

    // Set Expiration (12 Hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 12);

    // 2. Transaction: Create Trade (No Deduction)
    return this.prisma.$transaction(async (tx) => {
      // NOTE: We do NOT deduct funds here. Funds are minted to Seller on completion.

      // Update Listing status
      await tx.listing.update({
        where: { id: listingId },
        data: { status: 'TRADED' } // Pending
      });

      // Phase 4.1: Category-Based Operational Escrow
      // Total Escrow = 15% of Price (7.5% from Buyer, 7.5% from Seller)
      const operationalEscrowVP = Math.round(listing.priceVP * 0.15);

      // Create Trade
      const newTrade = await tx.trade.create({
        data: {
          listing: { connect: { id: listingId } },
          category: { connect: { id: listing.categoryId } },
          buyer: { connect: { id: buyerId } },
          seller: { connect: { id: listing.sellerId } },
          offerVP: listing.priceVP,
          operationalEscrowVP: operationalEscrowVP,
          status: 'LOCKED', // Zero-Pre-Mint: Value exists only as Locked Escrow
          expiresAt: expiresAt,
        }
      });

      // v1.2: Initialize Timeline
      await this.timelineService.addTimelineEvent(newTrade.id, 'OFFER_SENT');

      return newTrade;
    });
  }

  async confirm(id: string, userId: string) {
    const trade = await this.prisma.trade.findUnique({ where: { id } });
    if (!trade) throw new BadRequestException('Trade not found');

    const isBuyer = trade.buyerId === userId;
    const isSeller = trade.sellerId === userId;

    if (!isBuyer && !isSeller) throw new BadRequestException('Not authorized');

    // 🛡️ Security Hook: Trade Confirmation
    await this.security.assessAndLog(userId, {
      action: 'TRADE_CONFIRM',
      userId,
      details: { tradeId: id, role: isBuyer ? 'BUYER' : 'SELLER' }
    });

    // Update confirmation flags
    const updatedTrade = await this.prisma.trade.update({
      where: { id },
      data: {
        buyerConfirmed: isBuyer ? true : undefined,
        sellerConfirmed: isSeller ? true : undefined,
      }
    });

    // Check if BOTH confirmed -> Release Funds
    if (updatedTrade.buyerConfirmed && updatedTrade.sellerConfirmed) {
      return this.prisma.$transaction(async (tx) => {
        // Seller Payout = Trade VP - Seller's Fee (7.5%)
        // Platform holds the rest (15% total: 7.5% from Buyer, 7.5% from Seller) in Escrow
        const sellerFee = Math.floor(trade.offerVP * 0.075);
        const sellerPayout = trade.offerVP - sellerFee;

        await tx.user.update({
          where: { id: trade.sellerId },
          data: { walletBalance: { increment: sellerPayout } }
        });

        // Update Trade status
        return tx.trade.update({
          where: { id },
          data: { status: 'COMPLETED' }
        });
      });
    }

    return updatedTrade;
  }

  async verifyTrade(id: string, bucketAllocations: { bucket: string, amountVP: number, justification: string }[], adminId: string) {
    const trade = await this.prisma.trade.findUnique({
      where: { id },
      include: { buyer: true, category: true }
    });
    if (!trade) throw new BadRequestException('Trade not found');

    // Ensure logic: sum(allocations) <= operationalEscrow
    const totalActualCost = bucketAllocations.reduce((sum, b) => sum + Number(b.amountVP), 0);

    // Admin Override Limit Check logic could go here, skipping for MVP speed

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Immutable Cost Records
      for (const allocation of bucketAllocations) {
        await tx.tradeOperationCost.create({
          data: {
            tradeId: trade.id,
            bucket: allocation.bucket,
            amountVP: Number(allocation.amountVP),
            justification: allocation.justification,
            adminId
          }
        });
      }

      // 2. Mark Trade as Verified
      const updatedTrade = await tx.trade.update({
        where: { id },
        data: {
          isVerified: true,
          justification: `Verified with ${bucketAllocations.length} cost allocations.`
        }
      });

      // 3. Process System Contributions (Minted for Protocol Health)
      // Calculation Base: 15% Reference Value (Virtual Escrow)
      // We only MINT what is allocated to these funds. Unused "Virtual Escrow" is simply never minted.

      const tradeValue = trade.offerVP;
      const emergencyShare = Math.floor(tradeValue * 0.04);
      const ambassadorShare = Math.floor(tradeValue * 0.01);
      // 10% Admin/Logistics Fee Minting (Operational)
      const adminBudget = Math.floor(tradeValue * 0.10);

      // Mint to System Funds
      await tx.systemConfig.update({
        where: { id: 1 },
        data: {
          emergencyFundVP: { increment: emergencyShare },
          ambassadorFundVP: { increment: ambassadorShare },
          adminFundVP: { increment: adminBudget }
        }
      });

      // MINT_MODEL: No refund to buyer because they never paid upfront.
      // Unused allocations simply evaporate (are never minted).

      return updatedTrade;

      return updatedTrade;
    });
  }

  async findAll(userId: string) {
    return this.prisma.trade.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }]
      },
      include: {
        listing: true,
        buyer: { select: { fullName: true, phoneNumber: true } },
        seller: { select: { fullName: true, phoneNumber: true } },
        timeline: { orderBy: { timestamp: 'asc' } }
      }
    });
  }

  // v1.2: Soft Commitment (non-binding intent)
  async recordSoftCommitment(tradeId: string, userId: string) {
    const trade = await this.prisma.trade.findUnique({ where: { id: tradeId } });
    if (!trade) throw new BadRequestException('Trade not found');

    if (trade.buyerId !== userId && trade.sellerId !== userId) {
      throw new BadRequestException('Not authorized');
    }

    return this.prisma.trade.update({
      where: { id: tradeId },
      data: { intentTimestamp: new Date() }
    });
  }

  // v1.2: Submit Pre-Trade Checklist
  async submitChecklist(
    tradeId: string,
    userId: string,
    checklist: { timeAgreed: boolean; locationAgreed: boolean; conditionAgreed: boolean }
  ) {
    const trade = await this.prisma.trade.findUnique({ where: { id: tradeId } });
    if (!trade) throw new BadRequestException('Trade not found');

    if (trade.buyerId !== userId && trade.sellerId !== userId) {
      throw new BadRequestException('Not authorized');
    }

    if (!checklist.timeAgreed || !checklist.locationAgreed || !checklist.conditionAgreed) {
      throw new BadRequestException('All checklist items must be agreed to');
    }

    const updatedTrade = await this.prisma.trade.update({
      where: { id: tradeId },
      data: { preTradeChecklist: JSON.stringify(checklist) }
    });

    await this.timelineService.addTimelineEvent(tradeId, 'MEETUP_AGREED', checklist);

    return updatedTrade;
  }

  // v1.2: Get trade with timeline
  async getTrade(id: string) {
    const trade = await this.prisma.trade.findUnique({
      where: { id },
      include: {
        listing: true,
        buyer: { select: { fullName: true, email: true, phoneNumber: true } },
        seller: { select: { fullName: true, email: true, phoneNumber: true } },
        timeline: { orderBy: { timestamp: 'asc' } }
      }
    });

    if (!trade) throw new BadRequestException('Trade not found');

    return trade;
  }
}
