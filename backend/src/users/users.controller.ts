import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    findMe() {
        return this.usersService.findMe();
    }

    @Put(':id/profile')
    updateProfile(@Param('id') id: string, @Body() body: { bannerUrl?: string; themePreferences?: string; fullName?: string; avatarUrl?: string }) {
        return this.usersService.updateProfile(id, body);
    }

    @Post(':id/request-business')
    requestBusiness(@Param('id') id: string, @Body() body: { businessName: string; referralCode?: string }) {
        return this.usersService.requestBusinessVerification(id, body.businessName, body.referralCode);
    }

    @Post(':id/request-community')
    requestCommunity(@Param('id') id: string, @Body() body: { role: string; evidence: any }) {
        return this.usersService.requestCommunityVerification(id, body.role, body.evidence);
    }

    @Get('pending-businesses')
    getPendingBusinesses() {
        return this.usersService.findPendingBusinesses();
    }

    @Get('pending-community')
    getPendingCommunity() {
        return this.usersService.findPendingCommunityVerifications();
    }

    @Get('pending-ambassadors')
    getPendingAmbassadors() {
        return this.usersService.findPendingAmbassadors();
    }

    @Put(':id/approve-ambassador')
    approveAmbassador(@Param('id') id: string) {
        return this.usersService.approveAmbassador(id);
    }

    @Post(':id/apply-ambassador')
    applyAmbassador(@Param('id') id: string) {
        return this.usersService.applyForAmbassador(id);
    }

    @Put(':id/approve-business')
    approveBusiness(@Param('id') id: string, @Body() data: { verifierId: string; notes?: string; country?: string }) {
        return this.usersService.approveBusiness(id, data);
    }

    @Put(':id/approve-community')
    approveCommunity(@Param('id') id: string, @Body() data: { verifierId: string }) {
        return this.usersService.approveCommunityRequest(id, data.verifierId);
    }

    @Put(':id/upgrade')
    upgradeSubscription(@Param('id') id: string) {
        // Mock Payment: Just upgrade to PREMIUM
        return this.usersService.upgradeSubscription(id, 'PREMIUM');
    }

    @Post('social-login')
    socialLogin(@Body() body: { email: string; name: string; provider: string; photoUrl?: string }) {
        return this.usersService.socialLogin(body);
    }
}
