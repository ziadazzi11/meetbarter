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
        if (cached && this.isDisplayCacheFresh(cached.lastUpdated)) {
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
                lastUpdated: new Date(),
                // Phase 5: Market Sentiment Engine
                sentimentScore: this.calculateMarketSentiment(newListingsToday, activeTraders),
                isCrisisActive: false // Default to false, handled by external override or advanced logic later
            },
            create: {
                city,
                country,
                topCategories: JSON.stringify(topCategories),
                newListingsToday,
                activeTraders,
                lastUpdated: new Date(),
                sentimentScore: this.calculateMarketSentiment(newListingsToday, activeTraders),
                isCrisisActive: false
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
     * Phase 5: Market Sentiment Algorithm
     * Score 0-100 (100 = Booming, 0 = Collapse)
     * Failsafe: If inputs are suspicious (e.g. 0 active traders but high listings), allow it but log warning.
     */
    private calculateMarketSentiment(newListings: number, activeTraders: number): number {
        if (activeTraders === 0) return 50; // Neutral start if no data

        // Simple Velocity Model: Listings per Trader
        // Healthy market = 1-3 listings per active trader
        const velocity = newListings / activeTraders;

        // Normalize to 0-100
        // Ideal velocity 2.0 -> Score 100
        // Velocity 0.0 -> Score 0
        let score = (velocity / 2.0) * 100;

        // Cap at 100
        if (score > 100) score = 100;

        return Math.round(score);
    }

    /**
     * Check if cache is fresh (< 24h for Failsafe Mode)
     * If data is older than 24h, we consider it STALE and potentially dangerous for auto-pricing.
     */
    private isCacheFresh(lastUpdated: Date): boolean {
        const now = new Date();
        const diff = now.getTime() - lastUpdated.getTime();
        const hours = diff / (1000 * 60 * 60);
        return hours < 24; // Relaxed from 15 mins to 24h for "Safety" check
    }

    /**
     * Check if cache is fresh for display (< 15 mins)
     */
    private isDisplayCacheFresh(lastUpdated: Date): boolean {
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
            lastUpdated: cache.lastUpdated,
            sentimentScore: cache.sentimentScore,
            isCrisisActive: cache.isCrisisActive
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
