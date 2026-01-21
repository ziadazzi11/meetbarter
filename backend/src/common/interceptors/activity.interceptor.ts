import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ActivityInterceptor implements NestInterceptor {
    constructor(private prisma: PrismaService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const userEmail = request.headers['x-user-email']; // Simple emulation for this build

        return next.handle().pipe(
            tap(async () => {
                if (userEmail) {
                    try {
                        await this.prisma.user.update({
                            where: { email: userEmail as string },
                            data: { lastActivity: new Date() },
                        });
                    } catch (e) {
                        // Silently fail if user not found (e.g. login attempt)
                    }
                }
            }),
        );
    }
}
