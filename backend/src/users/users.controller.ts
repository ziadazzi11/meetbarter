import { Controller, Get, Post, Body, Param, Put, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionGuard } from '../common/guards/permission.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Permission } from '../security/security.types';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    findMe() {
        return this.usersService.findMe();
    }

    @Get(':id')
    getUser(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Get(':id/profile')
    getProfile(@Param('id') id: string) {
        return this.usersService.getPublicProfile(id);
    }

    @Put(':id/profile')
    @UseGuards(JwtAuthGuard)
    updateProfile(@Param('id') id: string, @Body() body: { bannerUrl?: string; themePreferences?: string; fullName?: string; avatarUrl?: string }) {
        return this.usersService.updateProfile(id, body);
    }

    @Post(':id/request-business')
    @UseGuards(JwtAuthGuard)
    requestBusiness(@Param('id') id: string, @Body() body: { businessName: string; evidence: any; referralCode?: string }) {
        return this.usersService.requestBusinessVerification(id, body.businessName, body.evidence, body.referralCode);
    }

    @Post(':id/submit-license')
    @UseGuards(JwtAuthGuard)
    submitLicense(@Param('id') id: string, @Body() body: {
        businessName?: string;
        registrationNumber: string;
        permitType: string;
        issuingAuthority: string;
        evidence: { links: string[]; photos: string[] };
        issuedAt: string;
        expiresAt: string;
    }) {
        return this.usersService.submitBusinessLicense(id, {
            ...body,
            issuedAt: new Date(body.issuedAt),
            expiresAt: new Date(body.expiresAt)
        });
    }

    @Post(':id/request-community')
    @UseGuards(JwtAuthGuard)
    requestCommunity(@Param('id') id: string, @Body() body: { role: string; evidence: any }) {
        return this.usersService.requestCommunityVerification(id, body.role, body.evidence);
    }

    @Get('pending-businesses')
    @UseGuards(JwtAuthGuard)
    async getPendingBusinesses(@Request() req: any) { // Auth: Admin, Mod, or Active Ambassador
        const { role, sub: userId } = req.user;
        if (role === 'ADMIN' || role === 'MODERATOR') {
            return this.usersService.findPendingBusinesses();
        }

        const user = await this.usersService.findOne(userId);
        if (user?.ambassadorStatus === 'ACTIVE') {
            return this.usersService.findPendingBusinesses();
        }

        throw new ForbiddenException('Access Denied: Requires Admin, Moderator, or Active Ambassador status.');
    }

    @Get('pending-community')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.APPROVE_BUSINESS)
    getPendingCommunity() {
        return this.usersService.findPendingCommunityVerifications();
    }

    @Get('pending-licenses')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.APPROVE_BUSINESS)
    getPendingLicenses() {
        return this.usersService.findPendingLicenses();
    }

    @Put(':id/verify-license')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.APPROVE_BUSINESS)
    verifyLicense(@Param('id') id: string, @Body() body: { adminId: string; status: 'VERIFIED' | 'REJECTED' | 'REVOKED'; notes?: string }) {
        return this.usersService.verifyBusinessLicense(id, body.adminId, body.status, body.notes);
    }

    @Post(':id/verify-phone/request')
    @UseGuards(JwtAuthGuard)
    async requestPhoneVerification(@Param('id') id: string, @Body('phoneNumber') phoneNumber: string) {
        return this.usersService.requestPhoneVerification(id, phoneNumber);
    }

    @Post(':id/verify-phone/confirm')
    @UseGuards(JwtAuthGuard)
    async confirmPhoneVerification(@Param('id') id: string, @Body('phoneNumber') phoneNumber: string, @Body('code') code: string) {
        return this.usersService.confirmPhoneVerification(id, phoneNumber, code);
    }

    @Get('pending-ambassadors')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.APPROVE_AMBASSADOR)
    getPendingAmbassadors() {
        return this.usersService.findPendingAmbassadors();
    }

    @Put(':id/approve-ambassador')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.APPROVE_AMBASSADOR)
    approveAmbassador(@Param('id') id: string) {
        return this.usersService.approveAmbassador(id);
    }

    @Post(':id/apply-ambassador')
    @UseGuards(JwtAuthGuard)
    applyAmbassador(@Param('id') id: string) {
        return this.usersService.applyForAmbassador(id);
    }

    @Put(':id/approve-business')
    @UseGuards(JwtAuthGuard)
    async approveBusiness(@Param('id') id: string, @Body() data: { verifierId: string; notes?: string; country?: string }, @Request() req: any) {
        const { role, sub: userId } = req.user;

        // Admin/Mod Override
        if (role === 'ADMIN' || role === 'MODERATOR') {
            return this.usersService.approveBusiness(id, data);
        }

        // Ambassador Check
        const user = await this.usersService.findOne(userId);
        if (user?.ambassadorStatus === 'ACTIVE') {
            return this.usersService.approveBusiness(id, data);
        }

        throw new ForbiddenException('Access Denied: Requires Admin, Moderator, or Active Ambassador status.');
    }

    @Put(':id/approve-community')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.APPROVE_BUSINESS)
    approveCommunity(@Param('id') id: string, @Body() data: { verifierId: string }) {
        return this.usersService.approveCommunityRequest(id, data.verifierId);
    }

    @Put(':id/upgrade')
    @UseGuards(JwtAuthGuard, PermissionGuard)
    @Permissions(Permission.GRANT_VP) // Reusing GRANT_VP as a proxy for financial upgrades
    upgradeSubscription(@Param('id') id: string) {
        // Mock Payment: Just upgrade to PREMIUM
        return this.usersService.upgradeSubscription(id, 'PREMIUM');
    }

    @Post('social-login')
    socialLogin(@Body() body: { email: string; name: string; provider: string; photoUrl?: string }) {
        return this.usersService.socialLogin(body);
    }
}
