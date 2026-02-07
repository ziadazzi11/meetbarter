import { Injectable, Logger } from '@nestjs/common';
import { ORIGIN_MULTIPLIERS, CONDITION_TABLE, AUTHENTICITY_TABLE } from './valuation.constants';

@Injectable()
export class ValuationService {
    private readonly logger = new Logger(ValuationService.name);

    /**
     * Calculate VP based on algorithmic rules.
     * Translate from Python logic provided by user.
     */
    calculateVP(item: {
        originType: string;
        condition: string;
        authenticityStatus: string;
        isRefurbished: boolean;
        originalPrice: number; // Reference Market Value (RMV)
    }, scarcityCoefficient: number = 1.0) {
        const rmv = item.originalPrice;

        const originMultiplier = ORIGIN_MULTIPLIERS[item.originType] || 1.0;
        const conditionFactor = CONDITION_TABLE[item.condition] || 0.75;
        const authenticityFactor = AUTHENTICITY_TABLE[item.authenticityStatus] || 0.8;

        const baseVp = rmv * originMultiplier;
        let adjustedVp = baseVp * conditionFactor;
        adjustedVp *= authenticityFactor;
        adjustedVp *= scarcityCoefficient;

        // System caps (thrift ethics)
        if (item.condition !== "NEW") {
            adjustedVp = Math.min(adjustedVp, rmv * 0.85);
        }

        if (item.authenticityStatus === "REPLICA_DECLARED") {
            adjustedVp = Math.min(adjustedVp, rmv * 0.40);
        }

        if (item.isRefurbished) {
            adjustedVp = Math.min(adjustedVp, rmv * 0.60);
        }

        // 🛡️ Economic Containment: Hard Cap (Survival Mode)
        // No item can ever be valued above 1000 VP automatically.
        const MAX_VP_CAP = 1000;
        adjustedVp = Math.min(adjustedVp, MAX_VP_CAP);

        return Math.round(adjustedVp);
    }
}
