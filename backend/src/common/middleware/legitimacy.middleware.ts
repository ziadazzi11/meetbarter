import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LegitimacyMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        /**
         * Institutional Integrity Header Injection
         * This reinforces the "One-Line Shield" at the technical protocol level.
         * Useful for forensic audits and regulatory transparency.
         */
        res.setHeader('X-Meetbarter-Nature', 'Closed-Loop Barter Coordination');
        res.setHeader('X-Meetbarter-Asset-Status', 'Non-Monetary Value Points');
        res.setHeader('X-Meetbarter-Service-Model', 'Cost-Based Operational Escrow');

        // The "One-Line Shield"
        res.setHeader('X-Meetbarter-Legal-Positioning', 'Coordination service delivery; no value exchange or currency brokerage.');

        next();
    }
}
