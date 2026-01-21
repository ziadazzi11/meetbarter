import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

/**
 * City Pulse Service - Aggregates city-level statistics
 * Cached for performance, refreshes every 15 minutes
 */
@Injectable()
export class CityPulseService {
    constructor(private prisma: PrismaService) { }

    /**
     * Get city pulse data (cached)
     */
    async getCityPulse(city: string, country: string) {
        // Try to get cached data
        let cached = await this.prisma.cityPulseCache.findUnique({
            where: {
                city_country: { city, country }
            }
        });

        // If cache is fresh (< 15 minutes), return it
        if (cached && this.isCacheFresh(cached.lastUpdated)) {
            return this.formatCityPulse(cached);
        }

        // Otherwise, refresh cache
        cached = await this.refreshCityCache(city, country);
        return this.formatCityPulse(cached);
    }

    /**
     * Get all cities with pulse data
     */
    async getAllCities() {
        const caches = await this.prisma.cityPulseCache.findMany({
            orderBy: { activeTraders: 'desc' },
            take: 50 // Limit to top 50 cities
        });

        return caches.map(cache => this.formatCityPulse(cache));
    }

    /**
     * Refresh cache for a specific city
     */
    private async refreshCityCache(city: string, country: string) {
        const topCategories = await this.calculateTopCategories(city, country);
        const newListingsToday = await this.getNewListingsToday(city, country);
        const activeTraders = await this.getActiveTraders(city, country);

        return this.prisma.cityPulseCache.upsert({
            where: {
                city_country: { city, country }
            },
            update: {
                topCategories: JSON.stringify(topCategories),
                newListingsToday,
                activeTraders,
                lastUpdated: new Date()
            },
            create: {
                city,
                country,
                topCategories: JSON.stringify(topCategories),
                newListingsToday,
                activeTraders,
                lastUpdated: new Date()
            }
        });
    }

    /**
     * Calculate top 5 categories in this city (last 30 days)
     */
    private async calculateTopCategories(city: string, country: string) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Get all trades in this city in last 30 days
        const trades = await this.prisma.trade.findMany({
            where: {
                createdAt: { gte: thirtyDaysAgo },
                listing: {
                    location: city,
                    country: country
                }
            },
            include: {
                category: true
            }
        });

        // Count by category
        const categoryCounts: Record<string, { id: string, name: string, count: number }> = {};

        trades.forEach(trade => {
            const catId = trade.categoryId;
            const catName = trade.category.name;

            if (!categoryCounts[catId]) {
                categoryCounts[catId] = { id: catId, name: catName, count: 0 };
            }
            categoryCounts[catId].count++;
        });

        // Get top 5
        return Object.values(categoryCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }

    /**
     * Get count of new listings created today
     */
    private async getNewListingsToday(city: string, country: string): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.prisma.listing.count({
            where: {
                location: city,
                country: country,
                createdAt: { gte: today },
                isActive: true
            }
        });
    }

    /**
     * Get count of traders active in last 7 days
     */
    private async getActiveTraders(city: string, country: string): Promise<number> {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Get unique users who created listings or made trades
        const listingUsers = await this.prisma.listing.findMany({
            where: {
                location: city,
                country: country,
                createdAt: { gte: sevenDaysAgo }
            },
            select: { sellerId: true },
            distinct: ['sellerId']
        });

        return listingUsers.length;
    }

    /**
     * Check if cache is fresh (< 15 minutes old)
     */
    private isCacheFresh(lastUpdated: Date): boolean {
        const now = new Date();
        const diff = now.getTime() - lastUpdated.getTime();
        const minutes = diff / (1000 * 60);
        return minutes < 15;
    }

    /**
     * Format cache data for API response
     */
    private formatCityPulse(cache: any) {
        return {
            city: cache.city,
            country: cache.country,
            topCategories: JSON.parse(cache.topCategories),
            newListingsToday: cache.newListingsToday,
            activeTraders: cache.activeTraders,
            lastUpdated: cache.lastUpdated
        };
    }

    /**
     * Cron job to refresh all city caches every 15 minutes
     */
    @Cron(CronExpression.EVERY_30_MINUTES)
    async refreshAllCaches() {
        console.log('[CityPulseCron] Refreshing city pulse caches...');

        // Get all unique city/country combinations
        const cities = await this.prisma.listing.findMany({
            select: {
                location: true,
                country: true
            },
            distinct: ['location', 'country']
        });

        for (const { location, country } of cities) {
            try {
                await this.refreshCityCache(location, country);
            } catch (error) {
                console.error(`Failed to refresh cache for ${location}, ${country}:`, error);
            }
        }

        console.log(`[CityPulseCron] Refreshed ${cities.length} city caches`);
    }
}
