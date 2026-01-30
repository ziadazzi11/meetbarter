import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { MfaService } from '../../auth/mfa.service';

@Injectable()
export class MfaGuard implements CanActivate {
    constructor(private mfaService: MfaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const mfaToken = request.headers['x-mfa-token'];

        // If MFA is not enabled on the account, we might allow (or block based on policy)
        // For Phase 2, we enforce it if enabled.
        if (user && user.mfaEnabled) {
            if (!mfaToken) {
                throw new UnauthorizedException('MFA Token Required');
            }

            const isValid = this.mfaService.verifyToken(mfaToken, user.mfaSecret);
            if (!isValid) {
                throw new UnauthorizedException('Invalid MFA Token');
            }
        }

        return true;
    }
}
