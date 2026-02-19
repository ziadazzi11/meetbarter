import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AnomalyDetectionService } from '../../security/anomaly-detection.service';

@Injectable()
export class SecurityInterceptor implements NestInterceptor {
    constructor(private anomalyDetection: AnomalyDetectionService) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const ip = request.ip || request.connection.remoteAddress;

        if (user) {
            // Evaluate risk on every authenticated request (optimized for Phase 2)
            const userId = user.userId || user.id;
            if (userId) {
                const riskScore = await this.anomalyDetection.evaluateRisk(userId, ip);
                request['riskScore'] = riskScore;
            }

            // If risk is extremely high, we might block here, but for now we let guards handle it
        }

        return next.handle();
    }
}
