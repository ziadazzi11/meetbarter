import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SemanticNoiseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(data => {
                // If response is not an object or is null, skip
                if (!data || typeof data !== 'object' || Array.isArray(data)) {
                    return data;
                }

                // Inject Behavioral Mirage / Noise
                // "Real" looking fields that mean nothing
                const noise = {
                    _sync_v: this.randomHex(4),
                    _shard_id: 'eu-west-' + Math.floor(Math.random() * 5),
                    _entropy_flag: Math.random() > 0.9 ? 'HIGH' : 'NORMAL',
                    // Sometimes inject a decoy "debug" field
                    ...(Math.random() > 0.95 ? { _debug_trace: '0x' + this.randomHex(8) } : {})
                };

                return { ...data, ...noise };
            }),
        );
    }

    private randomHex(length: number): string {
        const chars = '0123456789ABCDEF';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}
