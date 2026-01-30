import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { SignalIngestionService } from './signal-ingestion.service';

/**
 * Canary Interceptor - Honeypot Endpoint Detection
 * 
 * Purpose: Detect reconnaissance attempts by monitoring access to fake endpoints
 * Classification: AMBER (Strategic Defense Layer)
 * 
 * Strategy:
 * - Define honeypot routes that should never be accessed by legitimate users
 * - Log all access attempts with full forensic context
 * - Auto-flag accounts that touch canary routes
 * - Feed high-severity signals to Risk Engine
 */
@Injectable()
export class CanaryInterceptor implements NestInterceptor {
    constructor(private readonly signalService: SignalIngestionService) { }

    /**
     * Honeypot endpoints that should never be accessed
     * These appear legitimate but are traps for reconnaissance tools
     */
    private readonly CANARY_ROUTES = [
        '/api/internal/debug',
        '/api/test/admin',
        '/api/dev/sync',
        '/api/admin/users/export',
        '/api/internal/config',
        '/api/debug/logs',
        '/api/test/seed',
        '/api/dev/reset',
        '/api/internal/metrics',
        '/api/admin/vault/keys', // Especially dangerous - vault access attempt
    ];

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const path = request.path || request.url;

        // Check if this is a canary endpoint
        if (this.isCanaryRoute(path)) {
            this.handleCanaryAccess(request, path);

            // Return plausible 404 to avoid revealing it's a trap
            throw new NotFoundException({
                statusCode: 404,
                message: 'Cannot GET ' + path,
                error: 'Not Found',
            });
        }

        return next.handle();
    }

    private isCanaryRoute(path: string): boolean {
        return this.CANARY_ROUTES.some(canary => path.includes(canary));
    }

    private handleCanaryAccess(request: any, path: string): void {
        const userId = request.user?.id || null;
        const ip = request.ip || request.connection?.remoteAddress;
        const userAgent = request.headers['user-agent'];

        // Log full forensic context
        console.warn('🚨 CANARY ENDPOINT ACCESSED 🚨', {
            path,
            userId,
            ip,
            userAgent,
            timestamp: new Date().toISOString(),
            headers: request.headers,
            query: request.query,
            body: request.body,
        });

        // Feed high-severity signal to Risk Engine
        this.signalService.ingestSignal({
            type: 'CANARY_ACCESS',
            severity: 'CRITICAL',
            userId,
            metadata: {
                path,
                ip,
                userAgent,
                timestamp: new Date().toISOString(),
            },
        });

        // Additional signal for vault-related canaries (even more severe)
        if (path.includes('vault') || path.includes('keys')) {
            this.signalService.ingestSignal({
                type: 'VAULT_RECON_ATTEMPT',
                severity: 'CRITICAL',
                userId,
                metadata: {
                    path,
                    ip,
                    userAgent,
                    timestamp: new Date().toISOString(),
                    threat_level: 'SOVEREIGN_CORE_BREACH_ATTEMPT',
                },
            });
        }
    }
}
