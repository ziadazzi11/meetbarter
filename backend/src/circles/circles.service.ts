import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Circles Service - Manages Trade Circles (community groups)
 */
@Injectable()
export class CirclesService {
    constructor(private prisma: PrismaService) { }

    /**
     * Create a new trade circle
     */
    async createCircle(creatorId: string, name: string, description?: string, isPublic: boolean = true) {
        // Create circle
        const circle = await this.prisma.tradeCircle.create({
            data: {
                name,
                description,
                isPublic,
                creatorId
            }
        });

        // Auto-add creator as member
        await this.prisma.circleMembership.create({
            data: {
                userId: creatorId,
                circleId: circle.id
            }
        });

        return circle;
    }

    /**
     * Get all public circles, or all circles for a specific user (including private ones they're in)
     */
    async getCircles(userId?: string) {
        if (!userId) {
            // Public circles only
            return this.prisma.tradeCircle.findMany({
                where: { isPublic: true },
                include: {
                    memberships: {
                        select: { userId: true }
                    }
                }
            });
        }

        // Get all circles user is a member of (public + private)
        const memberships = await this.prisma.circleMembership.findMany({
            where: { userId },
            include: { circle: true }
        });

        return memberships.map(m => m.circle);
    }

    /**
     * Get circle by ID with member count
     */
    async getCircleById(id: string, requestingUserId?: string) {
        const circle = await this.prisma.tradeCircle.findUnique({
            where: { id },
            include: {
                memberships: {
                    select: { userId: true, joinedAt: true }
                }
            }
        });

        if (!circle) {
            throw new NotFoundException('Circle not found');
        }

        // Check access for private circles
        if (!circle.isPublic && requestingUserId) {
            const isMember = circle.memberships.some(m => m.userId === requestingUserId);
            if (!isMember) {
                throw new ForbiddenException('This circle is private');
            }
        }

        return circle;
    }

    /**
     * Join a circle
     */
    async joinCircle(userId: string, circleId: string) {
        const circle = await this.prisma.tradeCircle.findUnique({
            where: { id: circleId }
        });

        if (!circle) {
            throw new NotFoundException('Circle not found');
        }

        if (!circle.isPublic) {
            throw new ForbiddenException('Cannot join private circles without invitation');
        }

        // Check if already a member
        const existing = await this.prisma.circleMembership.findUnique({
            where: {
                userId_circleId: { userId, circleId }
            }
        });

        if (existing) {
            return { message: 'Already a member' };
        }

        return this.prisma.circleMembership.create({
            data: { userId, circleId }
        });
    }

    /**
     * Leave a circle
     */
    async leaveCircle(userId: string, circleId: string) {
        const membership = await this.prisma.circleMembership.findUnique({
            where: {
                userId_circleId: { userId, circleId }
            }
        });

        if (!membership) {
            throw new NotFoundException('Not a member of this circle');
        }

        await this.prisma.circleMembership.delete({
            where: { id: membership.id }
        });

        return { message: 'Left circle successfully' };
    }

    /**
     * Get listings in a circle
     */
    async getCircleListings(circleId: string, requestingUserId?: string) {
        // Verify access
        await this.getCircleById(circleId, requestingUserId);

        return this.prisma.listing.findMany({
            where: {
                circleId,
                isActive: true,
                status: 'ACTIVE'
            },
            include: {
                category: true,
                seller: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}
