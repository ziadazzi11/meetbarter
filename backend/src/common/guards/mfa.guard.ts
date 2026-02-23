import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { MfaService } from '../../auth/mfa.service';

@Injectable()
export class MfaGuard implements CanActivate {
    constructor(
        private mfaService: MfaService,
        private prisma: PrismaService,
        private encryptionService: EncryptionService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        let user = request.user;
        const mfaToken = request.headers['x-mfa-token'];

        // If user object from JWT doesn't have MFA info, fetch it
        if (user && typeof user.mfaEnabled === 'undefined') {
            const dbUser = await this.prisma.user.findUnique({
                where: { id: user.userId },
                select: { mfaEnabled: true, mfaSecret: true }
            });
            if (dbUser) {
                user = { ...user, ...dbUser };
            }
        }

        if (user && user.mfaEnabled) {
            if (!mfaToken) {
                throw new UnauthorizedException('MFA Token Required');
            }

            // Decrypt the secret if it's encrypted
            const secret = user.mfaSecret ? this.encryptionService.decrypt(user.mfaSecret) : null;

            if (!secret) {
                throw new UnauthorizedException('MFA Configuration Corrupt');
            }

            const isValid = this.mfaService.verifyToken(mfaToken, secret);
            if (!isValid) {
                throw new UnauthorizedException('Invalid MFA Token');
            }
        }

        return true;
    }
}
