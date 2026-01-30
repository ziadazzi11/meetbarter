import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { RiskEngine } from './risk.engine';
import { AuditLogger } from './audit.logger';
import { PrismaModule } from '../prisma/prisma.module';
import { VelocityGuard } from './velocity.guard';
import { LedgerService } from './ledger.service';
import { BehaviorAnalyzer } from './behavior.analyzer';
import { IpIntel } from './ip.intel';
import { TrustScore } from './trust.score';
import { FraudDetector } from './fraud.detector';
import { EncryptionService } from './encryption.service';
import { VaultStorageService } from './vault-storage.service';

import { ForensicLoggingService } from './forensic-logging.service';

import { AnomalyDetectionService } from './anomaly-detection.service';
import { AuditService } from './audit.service';

@Module({
    imports: [PrismaModule],
    providers: [
        SecurityService,
        EncryptionService,
        RiskEngine,
        AuditLogger,
        ForensicLoggingService,
        AnomalyDetectionService,
        VelocityGuard,
        BehaviorAnalyzer,
        IpIntel,
        TrustScore,
        FraudDetector,
        VaultStorageService,
        LedgerService,
        AuditService
    ],
    controllers: [],
    exports: [SecurityService, EncryptionService, AuditLogger, ForensicLoggingService, AnomalyDetectionService, VaultStorageService, LedgerService, AuditService],
})
export class SecurityModule { }
