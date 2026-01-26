import { Module } from '@nestjs/common';
import { TradesService } from './trades.service';
import { TradesController } from './trades.controller';
import { TimelineModule } from '../timeline/timeline.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [PrismaModule, TimelineModule, SecurityModule],
  controllers: [TradesController],
  providers: [TradesService],
  exports: [TradesService]
})
export class TradesModule { }

