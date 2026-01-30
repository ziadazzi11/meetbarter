import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ShadowbanGuard implements CanActivate {
    private readonly logger = new Logger(ShadowbanGuard.name);

    constructor(private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const user = req.user;

        if (!user) return true; // No user, standard handling

        // Check Fresh State (or use cached user from AuthGuard)
        // Assuming AuthGuard attaches full user object including shadowban status
        // If not, we might need to query or rely on AuthGuard populate.
        // For efficiency, let's assume AuthGuard provides a basic user and we might need to trust JWT claims OR query given the severity.
        // BETTER: Query cache/DB for critical security state.

        const freshUser = await this.prisma.user.findUnique({
            where: { id: user.userId || user.id },
            select: { isShadowbanned: true }
        });

        if (freshUser?.isShadowbanned) {
            // SHADOWBAN LOGIC:
            // 1. Allow GET (Read-only) to maintain illusion of normalcy
            if (req.method === 'GET') return true;

            // 2. Block POST/PUT/DELETE ("The Phantom Wall")
            // We want to return TRUE to the guard chain but somehow intercept the controller logic?
            // Guards can only return true/false. 
            // If we return FALSE, it throws 403 Forbidden (User knows they are banned).
            // We want 200 OK.

            // TRICK: We can't achieve "Fake 200" easily in a Guard alone without throwing a custom exception 
            // that a Global Filter catches and converts to 200 OK.

            throw new ShadowbanException();
        }

        return true;
    }
}

// Custom Exception for Shadowbanning
export class ShadowbanException extends Error { }
