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
import { SystemFreezeGuard } from './common/guards/system-freeze.guard';

// v1.2 Modules
import { TimelineModule } from './timeline/timeline.module';
import { ActivityModule } from './activity/activity.module';
import { CirclesModule } from './circles/circles.module';
import { CityPulseModule } from './city-pulse/city-pulse.module';
import { BountyModule } from './bounty/bounty.module';
import { SuccessionModule } from './succession/succession.module';
import { SecurityModule } from './security/security.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
    imports: [
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
        ModerationModule,
        // v1.2 Features
        TimelineModule,
        ActivityModule,
        CirclesModule,
        CityPulseModule,
        BountyModule,
        SuccessionModule,
        SecurityModule,
        AuthModule
    ],
    controllers: [AppController, AdminController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: SystemFreezeGuard,
        },
        // 🛡️ Security: Apply Rate Limiter Globally
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: ActivityInterceptor,
        },
    ],
})
export class AppModule { }
