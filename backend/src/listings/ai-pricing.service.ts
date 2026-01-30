import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

export enum ItemCondition {
    NEW = 'NEW',
    USED_GOOD = 'USED_GOOD',
    USED_FAIR = 'USED_FAIR',
}

@Injectable()
export class AiPricingService {
    private readonly logger = new Logger(AiPricingService.name);

    // In-memory cache to avoid DB hits on every calculation
    private currentMarketState = {
        sentiment: 0.5,
        isCrisis: true
    };

    constructor(private prisma: PrismaService) {
        this.refreshMarketState(); // Init on startup
    }

    // "Mandatory check every once in a while"
    // Runs every hour to analyze market news/data without slowing down user requests
    @Cron(CronExpression.EVERY_HOUR)
    async analyzeGlobalMarkets() {
        this.logger.log('🧠 AI Compassion Engine: Analyzing Global Market Signals...');

        // 1. MOCK EXTERNAL DATA FETCH (NewsAPI, GoldAPI, Forex)
        // In production, these would be real HTTP calls
        const goldPriceTrend = 1.15; // +15% (High Anxiety)
        const globalNewsSentiment = 0.3; // Negative News (War/Instability)
        const localCurrencyStability = 0.2; // Very Low

        // 2. CALCULATE SENTIMENT SCORE (0.0 - 1.0)
        // Lower = Worse Conditions
        let newSentiment = (globalNewsSentiment * 0.4) + (localCurrencyStability * 0.6);

        // Adjust for Gold (Safe Haven flows often mean market fear)
        if (goldPriceTrend > 1.1) {
            newSentiment -= 0.1; // Fear penalty
        }

        // 3. DEFINE CRISIS STATE
        // If Sentiment drops below 0.4, declare Crisis
        const isCrisis = newSentiment < 0.4;

        // 4. UPDATE SYSTEM CONFIG & CACHE
        this.currentMarketState = { sentiment: newSentiment, isCrisis };

        await this.prisma.systemConfig.update({
            where: { id: 1 },
            data: {
                marketSentimentIndex: newSentiment,
                isCrisisActive: isCrisis,
                lastMarketCheck: new Date()
            }
        });

        this.logger.log(`📉 Market Analysis Complete. Sentiment: ${newSentiment.toFixed(2)} | Crisis Mode: ${isCrisis ? 'ON' : 'OFF'}`);
    }

    private async refreshMarketState() {
        const config = await this.prisma.systemConfig.findFirst();
        if (config) {
            this.currentMarketState = {
                sentiment: config.marketSentimentIndex,
                isCrisis: config.isCrisisActive
            };
        }
    }

    /**
     * Calculates the price in Value Points (VP) based on original price and condition.
     * Logic:
     * - Brand New: 60% of original price
     * - Used (Good): 30% of original price
     * - Used (Fair): 20% of original price
     */
    calculatePrice(originalPrice: number, condition: string, country: string = 'Lebanon', categoryName: string = 'General'): number {
        let conditionMultiplier = 0.2; // Default to 20%

        switch (condition?.toUpperCase()) {
            case 'NEW':
                conditionMultiplier = 0.6;
                break;
            case 'USED_GOOD':
                conditionMultiplier = 0.3;
                break;
            case 'USED_FAIR':
                conditionMultiplier = 0.2;
                break;
            default:
                conditionMultiplier = 0.2;
        }

        const marketMultiplier = this.calculateScarcityCoefficient(country, categoryName);

        // Final AI Equation:
        // Value = Original * Condition * ScarcityFactor
        return Math.round(originalPrice * conditionMultiplier * marketMultiplier);
    }

    /**
     * Calculates coefficient using cached, asynchronous market data.
     * Exported for use in ValuationService.
     */
    calculateScarcityCoefficient(country: string, categoryName: string): number {
        const { sentiment, isCrisis } = this.currentMarketState;

        // 1. COUNTRY PROFILES
        const countryProfiles: { [key: string]: { ppp: number } } = {
            'USA': { ppp: 1.0 },
            'UAE': { ppp: 0.95 },
            'LEBANON': { ppp: 0.3 },
            'OTHER': { ppp: 0.7 }
        };
        const profile = countryProfiles[country?.toUpperCase()] || countryProfiles['OTHER'];

        // 2. COMPASSIONATE CLASSIFICATION
        const isEssential = ['Agriculture', 'Food', 'Medical', 'Home Goods', 'Survival'].includes(categoryName);
        const isImportHeavy = ['Electronics', 'Cars'].includes(categoryName);

        // === COMPASSIONATE LOGIC ===
        // If we are in CRISIS mode and the item is ESSENTIAL, logic changes.
        if (isCrisis && isEssential) {
            // We decouple from standard scarcity to prevent predation.
            // Instead of skyrocketing price due to demand, we cap it.
            return 1.1; // "Compassion Cap" - keeps food affordable even if currency crashes.
        }

        // Standard Logic for non-essentials or stable times
        let coefficient = 1.0;
        const referenceHealth = 0.7;

        // Dynamic Health Score mixing static PPP with live AI Sentiment
        // If sentiment is low, effective PPP drops further
        const effectivePPP = profile.ppp * sentiment;

        if (isImportHeavy) {
            // Imports get MORE expensive as Sentiment drops (Harder to get)
            coefficient = (referenceHealth / effectivePPP);
        } else {
            // Local goods follow the local economy
            coefficient = (effectivePPP / referenceHealth);
        }

        return Math.min(3.0, Math.max(0.3, coefficient));
    }
}
