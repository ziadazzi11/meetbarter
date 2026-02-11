import { Module, Global } from '@nestjs/common';
import { AdsService } from './ads.service';
import { SignalIngestionService } from './signal-ingestion.service';
import { RiskEngineService } from './risk-engine.service';
import { AdeService } from './ade.service';
import { SystemStateModule } from '../system-state/system-state.module';
import { CanaryController } from './recon/canary.controller';
import { CanaryInterceptor } from './canary.interceptor';

import { ProtocolShapingService } from './protocol-shaping.service';
import { ProtocolGuard } from './recon/protocol.guard';
import { HandshakeController } from './recon/handshake.controller';

@Global()
@Module({
    imports: [SystemStateModule],
    providers: [
        AdsService,
        SignalIngestionService,
        RiskEngineService,
        AdeService,
        CanaryInterceptor,

        ProtocolShapingService,
        ProtocolGuard,
    ],
    exports: [
        SignalIngestionService,
        AdsService,
        CanaryInterceptor,

        ProtocolShapingService,
        ProtocolGuard,
    ], // Export for use in other modules
    controllers: [CanaryController, HandshakeController]
})
export class AdsModule { }

