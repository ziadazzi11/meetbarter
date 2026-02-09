import { Injectable, Logger, BadRequestException, ForbiddenException, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogger } from '../security/audit.logger';

@Injectable()
export class GovernanceService {
    private readonly logger = new Logger(GovernanceService.name);

    constructor(
        private prisma: PrismaService,
        private auditLogger: AuditLogger
    ) { }

    /**
     * Creates a pending governance request for dual-control actions.
     */
    async requestAction(requesterId: string, actionType: string, payload: any): Promise<any> {
        this.logger.log(`Governance Request Initiated: ${actionType} by ${requesterId}`);

        const request = await this.prisma.governanceRequest.create({
            data: {
                requesterId,
                actionType,
                payload: JSON.stringify(payload),
                status: 'PENDING'
            }
        });

        // Log intent
        await this.auditLogger.log({
            action: `GOV_REQUEST_${actionType}`,
            userId: requesterId,
            details: { requestId: request.id, payload }
        });

        return {
            message: 'Action requires dual-control approval. Ticket created.',
            requestId: request.id,
            status: 'PENDING'
        };
    }

    /**
     * Approves and executes a pending governance request.
     * MUST be called by a different admin than the requester.
     */
    async approveAction(approverId: string, requestId: string): Promise<any> {
        const request = await this.prisma.governanceRequest.findUnique({
            where: { id: requestId }
        });

        if (!request) throw new NotFoundException('Request not found');
        if (request.status !== 'PENDING') throw new BadRequestException(`Request is already ${request.status}`);

        // 1. Dual Control Check: Approver != Requester
        if (request.requesterId === approverId) {
            this.auditLogger.log({
                action: 'GOV_VIOLATION_SELF_APPROVAL',
                userId: approverId,
                details: { requestId }
            }, 100); // Max risk score
            throw new ForbiddenException('Dual Control Violation: You cannot approve your own request.');
        }

        // 2. Execute Action (Pattern Match)
        try {
            await this.executeLogic(request.actionType, JSON.parse(request.payload));

            // 3. Mark Executed
            await this.prisma.governanceRequest.update({
                where: { id: requestId },
                data: {
                    status: 'EXECUTED',
                    approverId,
                    executedAt: new Date()
                }
            });

            this.logger.log(`Governance Action Executed: ${request.actionType} approved by ${approverId}`);

            return { status: 'EXECUTED', executedAt: new Date() };

        } catch (error) {
            this.logger.error(`Governance Execution Failed: ${error.message}`);
            throw new HttpException('Execution Failed', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private async executeLogic(actionType: string, _payload: any) {
        switch (actionType) {
            case 'FREEZE_SYSTEM':
                // In real app, this would update SystemConfig
                this.logger.warn('SYSTEM FREEZE PROTOCOL INITIATED');
                // await this.prisma.systemConfig.update(...)
                break;
            case 'WIPE_VAULT':
                this.logger.warn('VAULT WIPE PROTOCOL INITIATED');
                break;
            default:
                throw new BadRequestException('Unknown Action Type');
        }
    }
}
