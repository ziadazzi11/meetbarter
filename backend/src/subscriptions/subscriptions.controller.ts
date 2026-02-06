import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { IsString, IsNumber, IsOptional } from 'class-validator';

class SubscriptionRequestDto {
    @IsString()
    userId: string;

    @IsString()
    tier: string;

    @IsNumber()
    amount: number;

    @IsString()
    currency: string;

    @IsOptional()
    @IsString()
    duration?: 'MONTHLY' | 'YEARLY';
}

class VerificationDto {
    @IsString()
    adminId: string;

    @IsOptional()
    @IsString()
    transactionId?: string;
}

@Controller('subscriptions')
export class SubscriptionsController {
    constructor(private readonly subService: SubscriptionsService) { }

    @Get('plans')
    getPlans() {
        return this.subService.getPlans();
    }

    @Post('buy')
    requestSubscription(@Body() dto: SubscriptionRequestDto) {
        return this.subService.requestSubscription(dto.userId, dto.tier, dto.amount, dto.currency, dto.duration);
    }

    @Post(':id/verify')
    verifySubscription(
        @Param('id') id: string,
        @Body() dto: VerificationDto
    ) {
        return this.subService.verifySubscription(id, dto.adminId, dto.transactionId);
    }

    @Get('pending')
    getPending() {
        return this.subService.getPending();
    }

    @Get('user/:userId')
    getUserSubscriptions(@Param('userId') userId: string) {
        return this.subService.getUserSubscriptions(userId);
    }
}
