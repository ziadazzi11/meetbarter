import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { SignalIngestionService } from './signal-ingestion.service';
import { RiskEngineService } from './risk-engine.service';
import { AdeService } from './ade.service';

@Injectable()
export class AdsService implements OnModuleInit {
    private readonly logger = new Logger(AdsService.name);

    constructor(
        private signalIngestion: SignalIngestionService,
        private riskEngine: RiskEngineService,
        private ade: AdeService
    ) { }

    onModuleInit() {
        this.logger.log('Initializing Autonomous Defense System (ADS)...');

        // 🔗 The Neural Loop: Connect Senses to Brain to Muscle
        this.signalIngestion.getStream().subscribe(signal => {
            try {
                // 1. Analyze
                const riskProfile = this.riskEngine.evaluateSignal(signal);

                // 2. Decide & Act
                this.ade.decideAndAct(signal.source, riskProfile);
            } catch (err) {
                this.logger.error(`ADS Loop Error: ${err.message}`);
            }
        });
    }
}
