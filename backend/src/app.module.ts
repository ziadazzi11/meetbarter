/**
 * Copyright (c) 2026 Ziad Azzi. All Rights Reserved.
 * This software is proprietary and confidential.
 */
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { CategoriesModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ListingsModule } from './listings/listings.module';
import { TradesModule } from './trades/trades.module';
import { MessagesModule } from './messages/messages.module';
import { ModerationModule } from './moderation/moderation.module';
import { AdminController } from './admin/admin.controller';
import { ActivityInterceptor } from './common/interceptors/activity.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { SecurityInterceptor } from './common/interceptors/security.interceptor';
import { PiiScrubbingInterceptor } from './common/interceptors/pii-scrubbing.interceptor';
import { RequestSigningMiddleware } from './common/middleware/request-signing.middleware';
import { SystemFreezeGuard } from './common/guards/system-freeze.guard';
import { SystemStateGuard } from './common/guards/system-state.guard';
import { ShadowbanGuard } from './common/guards/shadowban.guard';
import { LegitimacyMiddleware } from './common/middleware/legitimacy.middleware';
import { PayloadEncryptionMiddleware } from './ads/recon/payload-encryption.middleware';

// v1.2 Modules
import { TimelineModule } from './timeline/timeline.module';
import { ActivityModule } from './activity/activity.module';
import { CityPulseModule } from './city-pulse/city-pulse.module';
import { BountyModule } from './bounty/bounty.module';
import { SuccessionModule } from './succession/succession.module';
import { SecurityModule } from './security/security.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { IntelligenceInterceptor } from './intelligence/intelligence.interceptor';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ValuationModule } from './valuation/valuation.module';
import { GovernanceModule } from './governance/governance.module';
import { IntelligenceModule } from './intelligence/intelligence.module';
import { SystemStateModule } from './system-state/system-state.module';
import { AdsModule } from './ads/ads.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { CanaryInterceptor } from './ads/canary.interceptor';
import { SemanticNoiseInterceptor } from './ads/recon/semantic-noise.interceptor';
import { ContributionsModule } from './contributions/contributions.module';
import { EventsModule } from './events/events.module';


import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        AuthModule,
        UsersModule,

        TradesModule,
        ScheduleModule.forRoot(), // Enable cron jobs
        // 🛡️ Security: Rate Limiting (Anti-DDoS)
        ThrottlerModule.forRoot([{
            ttl: 60000, // 60 seconds
            limit: 100, // Max 100 requests per minute per IP
        }]),
        CategoriesModule,
        UsersModule,
        PrismaModule,
        ListingsModule,
        TradesModule,
        MessagesModule,
        EventsModule,
        ModerationModule,
        NotificationsModule,
        // v1.2 Features
        TimelineModule,
        ActivityModule,
        CityPulseModule,
        BountyModule,
        SuccessionModule,
        SecurityModule,
        AuthModule,
        IntelligenceModule,
        ValuationModule,
        GovernanceModule,
        GovernanceModule,
        SystemStateModule,
        AdsModule,
        SubscriptionsModule,
        SubscriptionsModule,
        ContributionsModule,

    ],
    controllers: [AppController, AdminController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: SystemFreezeGuard,
        },
        // 🛡️ Survival: Enforce Global System Modes
        {
            provide: APP_GUARD,
            useClass: SystemStateGuard,
        },
        // 🛡️ Security: Apply Rate Limiter Globally
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        // 🛡️ ADS: Shadowban Protocol (Phantom Wall)
        {
            provide: APP_GUARD,
            useClass: ShadowbanGuard,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: SecurityInterceptor,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: ActivityInterceptor,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: PiiScrubbingInterceptor,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: IntelligenceInterceptor,
        },
        // 🛡️ ADS: Anti-Reconnaissance Layer
        {
            provide: APP_INTERCEPTOR,
            useClass: CanaryInterceptor,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: SemanticNoiseInterceptor,
        },
    ],
})
export class AppModule {
    configure(consumer: any) {
        consumer
            .apply(LegitimacyMiddleware, PayloadEncryptionMiddleware)
            .forRoutes('*'); // Protocol-level legal hardening & Encryption

        consumer
            .apply(RequestSigningMiddleware)
            .forRoutes('admin');
    }
}
