import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BannedUserGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.userId) {
            return true; // Let AuthGuard handle missing user
        }

        const dbUser = await this.prisma.user.findUnique({
            where: { id: user.userId },
            select: { isBanned: true, banExpiresAt: true, banReason: true }
        });

        if (!dbUser || !dbUser.isBanned) {
            return true;
        }

        // Check if ban expired
        if (dbUser.banExpiresAt && new Date() > dbUser.banExpiresAt) {
            // Auto-lift ban
            await this.prisma.user.update({
                where: { id: user.userId },
                data: { isBanned: false, banReason: null, banExpiresAt: null, bannedAt: null }
            });
            return true;
        }

        throw new ForbiddenException(
            `Access Denied: You are banned. Reason: ${dbUser.banReason || 'Violation of Terms'}. ${dbUser.banExpiresAt ? 'Expires: ' + dbUser.banExpiresAt.toLocaleString() : 'This ban is permanent.'}`
        );
    }
}
