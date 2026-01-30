import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GovernanceService } from './governance.service';

@Injectable()
export class ConsensusGuard implements CanActivate {
    constructor(
        private governanceService: GovernanceService,
        private reflector: Reflector
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user; // Assumes AuthGuard has run
        const actionType = this.reflector.get<string>('governance_action', context.getHandler());

        if (!actionType) return true; // No protection needed

        // Intercept logic: Instead of running the handler, create a request
        const payload = request.body;

        const governanceTicket = await this.governanceService.requestAction(user.id, actionType, payload);

        // Throw Accepted (202) to stop execution but indicate success in queueing
        throw new HttpException(governanceTicket, HttpStatus.ACCEPTED);
    }
}
