import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProtocolShapingService } from '../protocol-shaping.service';

/**
 * Protocol Guard - Enforce Handshake Protocol
 * 
 * Purpose: Protect sensitive endpoints with handshake validation
 * Classification: AMBER (Strategic Defense Layer)
 * 
 * Usage:
 * @UseGuards(ProtocolGuard)
 * @RequireHandshake() // Custom decorator
 * async createTrade() { ... }
 */

export const REQUIRE_HANDSHAKE_KEY = 'require_handshake';

/**
 * Decorator to mark endpoints that require handshake protocol
 */
export const RequireHandshake = () => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        Reflect.defineMetadata(REQUIRE_HANDSHAKE_KEY, true, descriptor.value);
        return descriptor;
    };
};

@Injectable()
export class ProtocolGuard implements CanActivate {
    private readonly logger = new Logger(ProtocolGuard.name);

    constructor(
        private readonly protocolService: ProtocolShapingService,
        private readonly reflector: Reflector,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const requireHandshake = this.reflector.get<boolean>(
            REQUIRE_HANDSHAKE_KEY,
            context.getHandler(),
        );

        // If endpoint doesn't require handshake, allow
        if (!requireHandshake) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const tokenId = this.extractToken(request);

        if (!tokenId) {
            this.logger.warn('Missing handshake token');
            throw new UnauthorizedException({
                statusCode: 401,
                message: 'Handshake token required',
                error: 'Unauthorized',
                hint: 'Initiate handshake via /api/handshake/init',
            });
        }

        // Validate token
        const isValid = this.protocolService.validateToken(
            tokenId,
            request.path || request.url,
        );

        if (!isValid) {
            this.logger.warn(`Invalid handshake token: ${tokenId}`);
            throw new UnauthorizedException({
                statusCode: 401,
                message: 'Invalid or expired handshake token',
                error: 'Unauthorized',
            });
        }

        // Optionally consume token for one-time use
        // this.protocolService.consumeToken(tokenId);

        return true;
    }

    /**
     * Extract token from request headers
     * Expected header: X-Handshake-Token: <tokenId>
     */
    private extractToken(request: any): string | null {
        const token = request.headers['x-handshake-token'];
        return token || null;
    }
}
