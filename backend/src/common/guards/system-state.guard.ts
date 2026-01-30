import { Injectable, CanActivate, ExecutionContext, ForbiddenException, ServiceUnavailableException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SystemStateService } from '../../system-state/system-state.service';

@Injectable()
export class SystemStateGuard implements CanActivate {
    constructor(
        private readonly systemStateService: SystemStateService,
        private readonly reflector: Reflector,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const mode = this.systemStateService.getMode();
        const request = context.switchToHttp().getRequest();
        const method = request.method;

        // 1. FROZEN or READ_ONLY: Block all write methods (POST, PUT, PATCH, DELETE)
        // Exception: Allow Login/Auth (handled by AuthController which might need whitelisting, but essentially we block functional writes)
        if (mode === 'FROZEN' || mode === 'READ_ONLY') {
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
                // Whitelist Login? For now, FROZEN means NO WRITES at all. 
                // Admin might need bypass, but we follow strict containment first.
                if (request.url.includes('/auth/login') && mode === 'READ_ONLY') {
                    return true; // Allow login in Read-Only to view things?
                }
                throw new ServiceUnavailableException(`System is in ${mode} mode. Writes are disabled.`);
            }
        }

        // 2. SAFE Mode: Block specific dangerous actions if not handled by Kill Switches explicitly
        // Kill Switches are granular, but Guard provides a safety net.
        if (mode === 'SAFE') {
            // Example: Block new user registration in SAFE mode
            if (request.url.includes('/auth/register')) {
                throw new ForbiddenException('Registration disabled in SAFE mode.');
            }
        }

        return true;
    }
}
