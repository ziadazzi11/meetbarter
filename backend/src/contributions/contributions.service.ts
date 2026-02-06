import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContributionsService {
    private readonly logger = new Logger(ContributionsService.name);

    constructor(private prisma: PrismaService) { }

    async createContribution(userId: string, data: { tradeId?: string, amount: number, currency: string, message?: string, isPublic: boolean }) {
        this.logger.log(`User ${userId} pledging contribution of ${data.amount} ${data.currency}`);

        return this.prisma.contribution.create({
            data: {
                userId,
                tradeId: data.tradeId,
                amount: data.amount,
                currency: data.currency,
                message: data.message,
                isPublic: data.isPublic,
                status: 'PENDING'
            }
        });
    }

    async getUserContributions(userId: string) {
        return this.prisma.contribution.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
}
