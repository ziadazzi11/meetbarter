import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SubscriptionsScheduler } from './subscriptions.scheduler';
import { ListingsModule } from '../listings/listings.module';

@Module({
    imports: [PrismaModule, ListingsModule],
    controllers: [SubscriptionsController],
    providers: [SubscriptionsService, SubscriptionsScheduler],
    exports: [SubscriptionsService],
})
export class SubscriptionsModule { }
