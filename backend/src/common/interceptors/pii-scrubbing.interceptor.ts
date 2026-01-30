import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class PiiScrubbingInterceptor implements NestInterceptor {

    /**
     * Layer XI: Data Loss Prevention (DLP)
     * Intercepts outgoing data and masks PII if the user is not authorized.
     */
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(data => this.scrub(data, context))
        );
    }

    private scrub(data: any, context: ExecutionContext): any {
        if (!data || typeof data !== 'object') return data;

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // If user is Admin, they can see raw data (Institutional Visibility)
        if (user && user.role === 'ADMIN') return data;

        // Deep scrub
        const scrubbed = JSON.parse(JSON.stringify(data));
        this.traverseAndMask(scrubbed);
        return scrubbed;
    }

    private traverseAndMask(obj: any) {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                // Mask emails
                obj[key] = obj[key].replace(emailRegex, (match: string) => {
                    const [user, domain] = match.split('@');
                    return `${user.substring(0, 2)}***@${domain}`;
                });
            } else if (typeof obj[key] === 'object') {
                this.traverseAndMask(obj[key]);
            }
        }
    }
}
