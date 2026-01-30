import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IntelligenceService } from './intelligence.service';

@Injectable()
export class IntelligenceInterceptor implements NestInterceptor {
    constructor(private intelligenceService: IntelligenceService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, query, user } = request;

        return next.handle().pipe(
            tap(() => {
                // Silent tracking of listing views
                if (method === 'GET' && url.startsWith('/listings/') && !url.includes('?')) {
                    const parts = url.split('/');
                    const listingId = parts[2];
                    if (listingId && listingId.length > 20) { // Simple UUID check
                        this.intelligenceService.logAnonymizedInteraction('VIEW_LISTING', listingId, user?.id);
                    }
                }
            }),
        );
    }
}
