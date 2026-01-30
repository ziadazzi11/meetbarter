import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';
import { SecurityService } from '../security/security.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { ForensicLoggingService } from '../security/forensic-logging.service';

import { AutomationService } from '../system-state/automation.service';

@Injectable()
export class TradesService {
  private readonly logger = new Logger(TradesService.name);

  constructor(
    private prisma: PrismaService,
    private timelineService: TimelineService,
    private security: SecurityService,
    private notificationsGateway: NotificationsGateway,
    private forensicLogging: ForensicLoggingService,
    private automation: AutomationService,
  ) { }

  async createTrade(listingId: string, buyerId: string, cashOffer?: number, cashCurrency?: string) {
    this.automation.reportEvent('TRADE_CREATE');

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

    // 🛡️ Economic Containment: Daily Velocity Limits (Survival Mode)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const dailyStats = await this.prisma.trade.aggregate({
      where: {
        buyerId,
        createdAt: { gte: oneDayAgo }
      },
      _count: { id: true },
      _sum: { offerVP: true }
    });

    const DAILY_TRADE_LIMIT = 5;
    const DAILY_VP_LIMIT = 5000;

    if (dailyStats._count.id >= DAILY_TRADE_LIMIT) {
      throw new BadRequestException(`Daily trade limit reached (${DAILY_TRADE_LIMIT}). Slow down to ensure ecosystem stability.`);
    }

    if ((dailyStats._sum.offerVP || 0) + listing.priceVP > DAILY_VP_LIMIT) {
      throw new BadRequestException(`Daily VP volume limit reached (${DAILY_VP_LIMIT}). Limit protects against rapid inflation.`);
    }

    // 2. Transaction: Create Trade (No Deduction)
    return this.prisma.$transaction(async (tx) => {
      // NOTE: We do NOT deduct funds here. Funds are minted to Seller on completion.

      // Update Listing status
      await tx.listing.update({
        where: { id: listingId },
        data: { status: 'TRADED' } // Pending
      });

      // Phase 4: LEGITIMACY PROTOCOL - Coordination & Verification Escrow
      const config = await (tx.systemConfig as any).findFirst({ where: { id: 1 } });
      const baseRate = config?.baseEscrowRate || 15;

      // Category-Based Ceiling (Safety Gate)
      let escrowPct = baseRate;
      const category = await tx.category.findUnique({ where: { id: listing.categoryId } });
      if (category) {
        const cap = this.getCategoryEscrowCap(category.name);
        escrowPct = Math.min(baseRate, cap);
      }

      // Total Escrow = (Price * EscrowPct) / 100
      const coordinationEscrowVP = Math.round(listing.priceVP * (escrowPct / 100));

      // Create Trade
      const newTrade = await (tx.trade as any).create({
        data: {
          listing: { connect: { id: listingId } },
          category: { connect: { id: listing.categoryId } },
          buyer: { connect: { id: buyerId } },
          seller: { connect: { id: listing.sellerId } },
          offerVP: listing.priceVP,
          coordinationEscrowVP: coordinationEscrowVP,
          status: 'LOCKED', // Zero-Pre-Mint: Value exists only as Locked Escrow
          expiresAt: expiresAt,
          cashOffer: cashOffer || null,
          cashCurrency: cashCurrency || 'USD',
        }
      });

      // Phase 1 Trust: Explicit Escrow Transaction
      await tx.transaction.create({
        data: {
          trade: { connect: { id: newTrade.id } },
          fromUser: { connect: { id: buyerId } },
          amountVP: coordinationEscrowVP,
          type: 'OPERATIONAL_ESCROW',
          timestamp: new Date()
        }
      });


      // v1.2: Initialize Timeline
      await this.timelineService.addTimelineEvent(newTrade.id, 'OFFER_SENT');

      // 🛡️ FORENSIC AUDIT
      await this.forensicLogging.logCriticalEvent('TRADE_CREATED', 'SYSTEM', {
        tradeId: newTrade.id,
        buyerId,
        sellerId: listing.sellerId,
        offerVP: listing.priceVP,
        cashOffer
      }, buyerId);

      return newTrade;
    });
  }

  async confirm(id: string, userId: string) {
    const trade = await this.prisma.trade.findUnique({ where: { id } });
    if (!trade) throw new BadRequestException('Trade not found');

    // 🏛️ IMMUTABLE STATE CONSTRAINT: Only LOCKED (Escrowed) trades can be confirmed.
    if (trade.status !== 'LOCKED') {
      throw new BadRequestException(`Invalid State Transition: Cannot confirm trade in ${trade.status} status.`);
    }

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
        const finalizedTrade = await tx.trade.update({
          where: { id },
          data: { status: 'COMPLETED' }
        });

        // Notify Buyer (Real-Time)
        this.notificationsGateway.sendNotification(trade.buyerId, 'TRADE_COMPLETED', {
          tradeId: id,
          title: 'Trade Finalized! 🎉'
        });

        return finalizedTrade;
      });
    }

    // Notify counterpart of confirmation
    this.notificationsGateway.sendNotification(isBuyer ? trade.sellerId : trade.buyerId, 'TRADE_CONFIRMED_PARTIAL', {
      tradeId: id,
      by: isBuyer ? 'Buyer' : 'Seller'
    });

    return updatedTrade;
  }

  async verifyTrade(id: string, bucketAllocations: { bucket: string, amountVP: number, justification: string }[], adminId: string) {
    const trade = await this.prisma.trade.findUnique({
      where: { id },
      include: { buyer: true, category: true }
    }) as any;
    if (!trade) throw new BadRequestException('Trade not found');

    // Rule 3: Cost-Bucket Constraints (Institutional Integrity)
    const validBuckets = ['MODERATION_REVIEW', 'DISPUTE_HANDLING', 'VERIFICATION_EFFORT', 'LOGISTICS_COORDINATION'];
    for (const allocation of bucketAllocations) {
      if (!validBuckets.includes(allocation.bucket)) {
        throw new BadRequestException(`Invalid Cost Bucket: ${allocation.bucket}`);
      }
      if (!allocation.justification || allocation.justification.length < 10) {
        throw new BadRequestException(`Mandatory Justification Required for ${allocation.bucket} (Min 10 chars)`);
      }
    }

    // Ensure logic: sum(allocations) <= coordinationEscrow
    const totalActualCost = bucketAllocations.reduce((sum, b) => sum + Number(b.amountVP), 0);
    if (totalActualCost > trade.coordinationEscrowVP) {
      throw new BadRequestException(`Actual cost (${totalActualCost} VP) exceeds Coordination Escrow cap (${trade.coordinationEscrowVP} VP)`);
    }

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

      // Logic: If Escrow > Actual Cost, we theoretically "Refund" the unused portion
      // Rule 4: Explicit Refund UX Enforcement
      const unusedEscrow = trade.coordinationEscrowVP - totalActualCost;
      if (unusedEscrow > 0) {
        await tx.transaction.create({
          data: {
            tradeId: trade.id,
            toUserId: trade.buyerId,
            amountVP: unusedEscrow,
            type: 'ESCROW_REFUND',
            timestamp: new Date()
          }
        });
      }

      return updatedTrade;
    });
  }

  /**
   * Rule 1: Category-Based Escrow Caps
   * Protects essentials and regulates high-risk trades.
   */
  private getCategoryEscrowCap(categoryName: string): number {
    const name = categoryName.toLowerCase();
    if (name.includes('food') || name.includes('medicine')) return 5;
    if (name.includes('service') || name.includes('labor')) return 10;
    if (name.includes('tool') || name.includes('machinery')) return 12;
    return 15; // Global Platform Cap
  }

  // Phase 1 Trust: Auto-Refund mechanism for expired trades
  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredTrades() {
    this.logger.log('Checking for expired trades...');
    const now = new Date();
    const expiredTrades = await this.prisma.trade.findMany({
      where: {
        status: 'LOCKED',
        expiresAt: { lt: now }
      }
    });

    for (const trade of expiredTrades) {
      this.logger.warn(`Auto-refunding expired trade ${trade.id}`);
      await this.prisma.$transaction(async (tx) => {
        // 1. Mark as CANCELLED
        await tx.trade.update({
          where: { id: trade.id },
          data: { status: 'CANCELLED' }
        });

        // 2. Record ESCROW_REFUND (Non-monetary in zero-pre-mint, but keeps ledger balanced)
        await tx.transaction.create({
          data: {
            tradeId: trade.id,
            toUserId: trade.buyerId,
            amountVP: trade.operationalEscrowVP,
            type: 'ESCROW_REFUND',
            timestamp: new Date()
          }
        });

        // 3. Reactivate Listing
        await tx.listing.update({
          where: { id: trade.listingId },
          data: { status: 'ACTIVE' }
        });

        await this.timelineService.addTimelineEvent(trade.id, 'TRADE_EXPIRED', { reason: 'Time limit reached' });
      });
    }
  }

  // Phase 1 Trust: Dispute Handling
  async disputeTrade(id: string, reason: string, userId: string) {
    const trade = await this.prisma.trade.findUnique({ where: { id } });
    if (!trade) throw new BadRequestException('Trade not found');

    // 🏛️ IMMUTABLE STATE CONSTRAINT: Cannot dispute finalized trades
    if (['COMPLETED', 'CANCELLED'].includes(trade.status)) {
      throw new BadRequestException('Institutional Rule: Finalized trades cannot be disputed.');
    }

    // Only buyer or seller can trigger dispute in Phase 1
    if (trade.buyerId !== userId && trade.sellerId !== userId) {
      throw new BadRequestException('Not authorized');
    }

    const updatedTrade = await this.prisma.trade.update({
      where: { id },
      data: {
        status: 'DISPUTED',
        justification: `Dispute opened by ${userId}: ${reason}`
      }
    });

    await this.timelineService.addTimelineEvent(id, 'DISPUTE_OPENED', { reason, userId });

    // 🛡️ FORENSIC AUDIT
    await this.forensicLogging.logCriticalEvent('TRADE_DISPUTED', 'SYSTEM', {
      tradeId: id,
      reason,
      userId
    }, userId);

    return updatedTrade;
  }

  async resolveDispute(id: string, action: 'RELEASE' | 'REFUND', notes: string, adminId: string) {
    const trade = await this.prisma.trade.findUnique({
      where: { id },
      include: { listing: true }
    });
    if (!trade) throw new BadRequestException('Trade not found');
    if (trade.status !== 'DISPUTED') throw new BadRequestException('Trade is not in DISPUTED state');

    return this.prisma.$transaction(async (tx) => {
      // 1. Log to Audit
      await tx.auditLog.create({
        data: {
          action: 'DISPUTE_RESOLVED',
          adminId,
          details: JSON.stringify({ tradeId: id, action, notes }),
          hash: '', // Handled by standard logging later
          previousHash: ''
        }
      });

      if (action === 'RELEASE') {
        // Release to Seller: Mark COMPLETED
        await tx.trade.update({
          where: { id },
          data: { status: 'COMPLETED', justification: `Dispute released by admin: ${notes}` }
        });

        // Payout Record
        await tx.transaction.create({
          data: {
            tradeId: id,
            toUserId: trade.sellerId,
            amountVP: trade.offerVP,
            type: 'PAYOUT',
            timestamp: new Date()
          }
        });

        // Update seller wallet
        await tx.user.update({
          where: { id: trade.sellerId },
          data: { walletBalance: { increment: trade.offerVP } }
        });

      } else {
        // Refund to Buyer: Mark CANCELLED
        await tx.trade.update({
          where: { id },
          data: { status: 'CANCELLED', justification: `Dispute refunded by admin: ${notes}` }
        });

        // Reactivate Listing
        await tx.listing.update({
          where: { id: trade.listingId },
          data: { status: 'ACTIVE' }
        });

        // Refund Record
        await tx.transaction.create({
          data: {
            tradeId: id,
            toUserId: trade.buyerId,
            amountVP: trade.operationalEscrowVP,
            type: 'ESCROW_REFUND',
            timestamp: new Date()
          }
        });
      }

      await this.timelineService.addTimelineEvent(id, 'DISPUTE_RESOLVED', { action, notes, adminId });
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

    const updatedTrade = await this.prisma.trade.update({
      where: { id: tradeId },
      data: { intentTimestamp: new Date() }
    });

    // Notify Counterparty (Real-Time)
    this.notificationsGateway.sendNotification(userId === trade.buyerId ? trade.sellerId : trade.buyerId, 'INTENT_RECORDED', {
      tradeId,
      message: 'Counterparty has recorded their intent to trade!'
    });

    return updatedTrade;
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

    // Notify Counterparty (Real-Time)
    this.notificationsGateway.sendNotification(userId === trade.buyerId ? trade.sellerId : trade.buyerId, 'MEETUP_AGREED', {
      tradeId,
      message: 'Meetup details agreed! Ready for exchange.'
    });

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

  async addCashSweetener(tradeId: string, userId: string, cashOffer: number, cashCurrency: string) {
    const trade = await this.prisma.trade.findUnique({ where: { id: tradeId } });
    if (!trade) throw new BadRequestException('Trade not found');

    if (trade.buyerId !== userId) {
      throw new BadRequestException('Only the buyer can propose a cash sweetener');
    }

    if (trade.status === 'COMPLETED' || trade.status === 'CANCELLED') {
      throw new BadRequestException('Trade is already finalized');
    }

    const updatedTrade = await (this.prisma.trade as any).update({
      where: { id: tradeId },
      data: {
        cashOffer,
        cashCurrency
      }
    });

    // Notify Timeline
    await this.timelineService.addTimelineEvent(tradeId, 'CASH_PROPOSED', { amount: cashOffer, currency: cashCurrency });

    // Notify Seller (Real-Time)
    this.notificationsGateway.sendNotification(trade.sellerId, 'CASH_PROPOSED', {
      tradeId,
      amount: cashOffer,
      currency: cashCurrency
    });

    return updatedTrade;
  }
}
