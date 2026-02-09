import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';
import { SignalIngestionService } from '../../ads/signal-ingestion.service';

@Injectable()
export class ActivityInterceptor implements NestInterceptor {
    constructor(
        private prisma: PrismaService,
        private signalIngestion: SignalIngestionService
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const userEmail = request.headers['x-user-email']; // Simple emulation for this build
        const clientIp = request.ip || request.connection.remoteAddress;

        // 📡 ADS SIGNAL: Raw Traffic
        this.signalIngestion.emitSignal({
            type: 'HTTP_REQUEST',
            source: clientIp,
            timestamp: Date.now(),
            metadata: {
                method: request.method,
                path: request.url,
                // In prod, we'd calculate rate limit budget here from ThrottlerGuard metadata
                rateLimitRemaining: 100 // Stub
            }
        });

        return next.handle().pipe(
            tap(async () => {
                if (userEmail) {
                    try {
                        await this.prisma.user.update({
                            where: { email: userEmail as string },
                            data: { lastActivity: new Date() },
                        });
                    } catch {
                        // Silently fail if user not found (e.g. login attempt)
                    }
                }
            }),
        );
    }
}
