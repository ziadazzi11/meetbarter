import { Controller, Get, Param, Query } from '@nestjs/common';
import { CityPulseService } from './city-pulse.service';

@Controller('city-pulse')
export class CityPulseController {
    constructor(private cityPulseService: CityPulseService) { }

    @Get()
    async getAllCities() {
        return this.cityPulseService.getAllCities();
    }

    @Get(':city')
    async getCityPulse(
        @Param('city') city: string,
        @Query('country') country: string = 'Lebanon'
    ) {
        return this.cityPulseService.getCityPulse(city, country);
    }
}
