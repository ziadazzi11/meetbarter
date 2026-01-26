import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { RiskEngine } from './risk.engine';
import { AuditLogger } from './audit.logger';
import { PrismaModule } from '../prisma/prisma.module';
import { VelocityGuard } from './velocity.guard';
import { BehaviorAnalyzer } from './behavior.analyzer';
import { IpIntel } from './ip.intel';
import { TrustScore } from './trust.score';
import { FraudDetector } from './fraud.detector';

@Module({
    imports: [PrismaModule],
    providers: [
        SecurityService,
        RiskEngine,
        AuditLogger,
        VelocityGuard,
        BehaviorAnalyzer,
        IpIntel,
        TrustScore,
        FraudDetector
    ],
    exports: [SecurityService],
})
export class SecurityModule { }
