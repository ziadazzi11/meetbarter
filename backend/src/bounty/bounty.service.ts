import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BountyService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.bounty.findMany({
            orderBy: { createdAt: 'desc' },
            include: { assignee: { select: { fullName: true } } }
        });
    }

    async create(data: any) {
        return this.prisma.bounty.create({ data });
    }

    async claim(bountyId: string, userId: string) {
        return this.prisma.bounty.update({
            where: { id: bountyId },
            data: { status: 'CLAIMED', assigneeId: userId }
        });
    }

    async submit(bountyId: string, evidence: string) {
        return this.prisma.bounty.update({
            where: { id: bountyId },
            data: { status: 'SUBMITTED', submissionEvidence: evidence }
        });
    }

    async complete(bountyId: string) {
        const bounty = await this.prisma.bounty.findUnique({ where: { id: bountyId } });
        if (!bounty || !bounty.assigneeId) throw new Error("Invalid Bounty");

        // Transaction: Mark complete + Grant VP
        return this.prisma.$transaction([
            this.prisma.bounty.update({
                where: { id: bountyId },
                data: { status: 'COMPLETED' }
            }),
            this.prisma.user.update({
                where: { id: bounty.assigneeId },
                data: { walletBalance: { increment: bounty.rewardVP } }
            }),
            this.prisma.auditLog.create({
                data: {
                    action: 'BOUNTY_REWARD',
                    details: JSON.stringify({ bountyId: bounty.id, reward: bounty.rewardVP }),
                    adminId: 'SYSTEM'
                }
            })
        ]);
    }
}
