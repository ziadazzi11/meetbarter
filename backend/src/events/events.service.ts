import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
    constructor(private prisma: PrismaService) { }

    async createEvent(data: { title: string; description: string; location: string; imageUrl?: string; startDate: string; endDate: string; organizerId: string }) {
        return this.prisma.communityEvent.create({
            data: {
                ...data,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
            }
        });
    }

    async findAll() {
        return this.prisma.communityEvent.findMany({
            where: { status: { not: 'CANCELLED' } },
            orderBy: { startDate: 'asc' }
        });
    }

    async findOne(id: string) {
        return this.prisma.communityEvent.findUnique({
            where: { id },
            include: {
                eventListings: {
                    include: {
                        seller: { select: { id: true, fullName: true, avatarUrl: true } }
                    }
                },
                organizer: { select: { id: true, fullName: true } }
            }
        });
    }

    async joinEvent(eventId: string, listingId: string, userId: string) {
        const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
        if (!listing || listing.sellerId !== userId) throw new BadRequestException("Listing not found or unauthorized");

        return this.prisma.listing.update({
            where: { id: listingId },
            data: { communityEventId: eventId }
        });
    }
}
