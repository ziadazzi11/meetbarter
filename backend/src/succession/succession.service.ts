
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SuccessionService {
    constructor(private prisma: PrismaService) { }

    // Seed Gia Alkoroum
    async ensureGiaExists(parentId: string) {
        const giaName = "Gia Alkoroum";
        // Date of Birth: 2024-09-04
        const dob = new Date('2024-09-04T00:00:00Z');

        // Calculate Unlock Date: DOB + 21 Years
        const unlockDate = new Date(dob);
        unlockDate.setFullYear(unlockDate.getFullYear() + 21); // 2045-09-04

        const existing = await this.prisma.successor.findFirst({ where: { fullName: giaName } });

        if (!existing) {
            await this.prisma.successor.create({
                data: {
                    fullName: giaName,
                    dateOfBirth: dob,
                    parentId: parentId,
                    unlockDate: unlockDate,
                    isUnlocked: false
                }
            });
            console.log(`[Succession] Seeded Successor: ${giaName}. Locked until ${unlockDate.toISOString()}`);
        }
    }

    async checkStatus(successorId: string) {
        const successor = await this.prisma.successor.findUnique({ where: { id: successorId } });
        if (!successor) throw new BadRequestException("Successor not found");

        const now = new Date();
        const isEligible = now >= successor.unlockDate;

        return {
            fullName: successor.fullName,
            isUnlocked: successor.isUnlocked,
            isEligibleTime: isEligible,
            unlockDate: successor.unlockDate,
            timeRemainingMs: successor.unlockDate.getTime() - now.getTime()
        };
    }

    // Daily Check to Auto-Unlock if eligible
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async checkUnlocks() {
        const now = new Date();
        const eligibleSuccessors = await this.prisma.successor.findMany({
            where: {
                isUnlocked: false,
                unlockDate: { lte: now }
            }
        });

        for (const succ of eligibleSuccessors) {
            await this.prisma.successor.update({
                where: { id: succ.id },
                data: { isUnlocked: true }
            });
            console.log(`[Succession] UNLOCKED Successor: ${succ.fullName}`);
        }
    }
}
