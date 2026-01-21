import { Module } from '@nestjs/common';
import { BountyService } from './bounty.service';
import { BountyController } from './bounty.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [BountyController],
    providers: [BountyService],
})
export class BountyModule { }
