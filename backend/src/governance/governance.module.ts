import { Module } from '@nestjs/common';
import { GovernanceService } from './governance.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SecurityModule } from '../security/security.module';

@Module({
    imports: [PrismaModule, SecurityModule],
    providers: [GovernanceService],
    exports: [GovernanceService],
})
export class GovernanceModule { }
