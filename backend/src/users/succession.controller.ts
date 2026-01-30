import { Controller, Post, Body, Get, UnauthorizedException, Headers, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('succession')
export class SuccessionController {
    constructor(private readonly prisma: PrismaService) { }

    @Get('me')
    async getMyHeirs(@Headers('x-user-email') email: string) {
        if (!email) throw new UnauthorizedException();
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { successors: true }
        });
        if (!user) throw new NotFoundException('User not found');

        return {
            heir1Name: user.heir1Name,
            heir1Key: user.heir1Key,
            heir2Name: user.heir2Name,
            heir2Key: user.heir2Key,
            heir3Name: user.heir3Name,
            heir3Key: user.heir3Key,
            heir4Name: user.heir4Name,
            heir4Key: user.heir4Key,
            heir5Name: user.heir5Name,
            heir5Key: user.heir5Key,
            lastActivity: user.lastActivity,
            successors: user.successors
        };
    }

    @Post('update')
    async updateHeirs(
        @Headers('x-user-email') email: string,
        @Body() heirs: any
    ) {
        if (!email) throw new UnauthorizedException();
        return this.prisma.user.update({
            where: { email },
            data: {
                heir1Name: heirs.heir1Name,
                heir1Key: heirs.heir1Key,
                heir2Name: heirs.heir2Name,
                heir2Key: heirs.heir2Key,
                heir3Name: heirs.heir3Name,
                heir3Key: heirs.heir3Key,
                heir4Name: heirs.heir4Name,
                heir4Key: heirs.heir4Key,
                heir5Name: heirs.heir5Name,
                heir5Key: heirs.heir5Key,
            }
        });
    }

    @Post('claim')
    async claimAccount(
        @Body('targetEmail') targetEmail: string,
        @Body('keys') keys: string[], // [key1, key2, key3, key4, key5]
        @Body('deathDate') deathDate: string,
        @Body('deathPlace') deathPlace: string,
        @Body('mokhtarName') mokhtarName: string,
        @Body('mokhtarLicense') mokhtarLicense: string,
    ) {
        const user = await this.prisma.user.findUnique({ where: { email: targetEmail } });
        if (!user) throw new NotFoundException('Target account not found');

        // 1. Six-Year Inactivity Check
        const sixYearsAgo = new Date();
        sixYearsAgo.setFullYear(sixYearsAgo.getFullYear() - 6);
        if (user.lastActivity > sixYearsAgo) {
            throw new UnauthorizedException('Survival Protocol Blocked: Account active within the last 6 years (2190 days).');
        }

        // 2. Mokhtar Certificate Check
        if (!deathDate || !deathPlace || !mokhtarName || !mokhtarLicense) {
            throw new UnauthorizedException('Incomplete Death Registration. Assessment of Arabic Mokhtar certificate required.');
        }

        // 3. 5-Heir Multi-Auth Check
        const dbKeys = [user.heir1Key, user.heir2Key, user.heir3Key, user.heir4Key, user.heir5Key];
        const allKeysMatch = keys.every((key, index) => key === dbKeys[index]);

        if (!allKeysMatch) {
            throw new UnauthorizedException('Multi-Heir Overrule Denied. Succession Keys are invalid.');
        }

        // 4. Finalize Claim
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                isDeceased: true,
                deathDate,
                deathPlace,
                mokhtarName,
                mokhtarLicense
            }
        });

        // In a real system, we might return temporary access or trigger password reset
        return {
            success: true,
            message: 'Heir Protocol Authenticated. Access Recovery Authorized for ' + user.fullName,
            recoveryToken: 'RECOVERY_SIGNAL_' + Math.random().toString(36).substr(2, 9).toUpperCase()
        };
    }
}
