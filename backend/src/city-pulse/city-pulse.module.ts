import { Module } from '@nestjs/common';
import { CityPulseService } from './city-pulse.service';
import { CityPulseController } from './city-pulse.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [CityPulseController],
    providers: [CityPulseService],
    exports: [CityPulseService]
})
export class CityPulseModule { }
