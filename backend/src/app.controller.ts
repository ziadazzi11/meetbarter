import { Controller, Get } from '@nestjs/common';
import { SystemStateService } from './system-state/system-state.service';

@Controller()
export class AppController {
    constructor(private readonly systemStateService: SystemStateService) { }

    @Get()
    getHello(): string {
        return 'Hello from MeetBarter Backend! (Running locally on SQLite)';
    }

    @Get('system/config/public')
    async getPublicConfig() {
        return this.systemStateService.getPublicConfig();
    }
}
