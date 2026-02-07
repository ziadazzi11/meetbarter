import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesService } from '../messages/messages.service';

@Injectable()
export class TradesService {
  constructor(
    private prisma: PrismaService,
    private messagesService: MessagesService,
  ) { }

  async initiateTrade(buyerId: string, listingId: string, offerVP: number) {
    // 1. Check Listing Status
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new BadRequestException('Listing not found');
    }

    if (listing.status !== 'ACTIVE') {
      throw new BadRequestException('Listing is no longer active (Reserved, Traded, or Archived)');
    }

    // 2. Create Trade Record (Awaiting Fee)
    const trade = await this.prisma.trade.create({
      data: {
        listingId,
        buyerId,
        sellerId: listing.sellerId,
        categoryId: listing.categoryId,
        offerVP,
        status: 'AWAITING_FEE', // Gated state
        timeline: {
          create: {
            state: 'AWAITING_FEE',
            metadata: JSON.stringify({ offerVP })
          }
        }
      },
    });

    // Return the trade. Conversation is NOT created yet.
    return { trade, message: "Trade initiated. Please pay brokerage fee to unlock chat." };
  }

  async processTradeFee(tradeId: string, userId: string) {
    const trade = await this.prisma.trade.findUnique({ where: { id: tradeId } });
    if (!trade || trade.buyerId !== userId) throw new BadRequestException("Invalid Trade");

    if (trade.status !== 'AWAITING_FEE') {
      return { message: "Fee already paid or trade invalid state" };
    }

    // 1. Update Trade Status
    const updatedTrade = await this.prisma.trade.update({
      where: { id: tradeId },
      data: { status: 'OFFER_MADE' }
    });

    // 2. Lock Listing
    await this.prisma.listing.update({
      where: { id: trade.listingId },
      data: { status: 'RESERVED' }
    });

    // 3. Log Timeline
    await this.prisma.tradeTimeline.create({
      data: {
        tradeId,
        state: 'OFFER_MADE',
        metadata: JSON.stringify({ userId })
      }
    });

    // 3. Create/Find Conversation (Now allowed)
    const conversation = await this.messagesService.findOrCreateConversation(trade.buyerId, trade.sellerId);

    return { trade: updatedTrade, conversation, message: "Fee Paid. Item Reserved. Chat Unlocked." };
  }

  async resolveDispute(tradeId: string, action: string, reason: string, adminId: string) {
    // 1. Validate Trade
    const trade = await this.prisma.trade.findUnique({ where: { id: tradeId } });
    if (!trade) throw new BadRequestException("Trade not found");

    // 2. Determine Outcome
    let newStatus = 'DISPUTE_RESOLVED';
    let listingStatus = 'ARCHIVED'; // Default to closed

    if (action === 'REFUND_BUYER') {
      newStatus = 'CANCELLED';
      listingStatus = 'ACTIVE'; // Re-list
    } else if (action === 'RELEASE_FUNDS') {
      newStatus = 'COMPLETED';
      listingStatus = 'ARCHIVED';
    }

    // 3. Update Trade
    const updatedTrade = await this.prisma.trade.update({
      where: { id: tradeId },
      data: { status: newStatus as any }
    });

    // 4. Update Listing
    await this.prisma.listing.update({
      where: { id: trade.listingId },
      data: { status: listingStatus as any }
    });

    // 5. Log Dispute Resolution
    await this.prisma.tradeTimeline.create({
      data: {
        tradeId,
        state: newStatus,
        metadata: JSON.stringify({ action, reason, adminId })
      }
    });

    return updatedTrade;
  }

  async verifyTrade(tradeId: string, allocations: { bucket: string, amountVP: number, justification: string }[], adminId: string) {
    // 1. Validate Trade
    const trade = await this.prisma.trade.findUnique({ where: { id: tradeId } });
    if (!trade) throw new BadRequestException("Trade not found");

    // 2. Record Operational Costs (Buckets)
    for (const alloc of allocations) {
      await this.prisma.tradeOperationCost.create({
        data: {
          tradeId,
          bucket: alloc.bucket,
          amountVP: alloc.amountVP,
          justification: alloc.justification,
          adminId
        }
      });
    }

    // 3. Mark as Reality Checked
    const updatedTrade = await this.prisma.trade.update({
      where: { id: tradeId },
      data: { isRealityChecked: true }
    });

    // 4. Log in Timeline
    await this.prisma.tradeTimeline.create({
      data: {
        tradeId,
        state: 'TRADE_VERIFIED',
        metadata: JSON.stringify({ adminId, totalAllocated: allocations.reduce((a, b) => a + b.amountVP, 0) })
      }
    });

    return updatedTrade;
  }
}
