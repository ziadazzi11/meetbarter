
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrustScore {
    // 9. Trust Score Model
    // T0 = Unverified ... T4 = Institutional Partner

    constructor(private prisma: PrismaService) { }

    async calculateGlobalTrust(userId: string): Promise<string> { // Returns T-Level
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) return 'T0';

        let score = user.globalTrustScore || 0;

        // Institutional Override
        if (user.verificationLevel === 3) return 'T4';

        // Community Anchor
        if (user.ambassadorStatus === 'ACTIVE') return 'T3';

        // Trusted Trader
        if (score > 80 && user.isBusiness) return 'T2';

        // Verified
        if (score > 20) return 'T1';

        return 'T0';
    }
}
