import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    getHello(): string {
        return 'Hello from Dekish Backend! (Running locally on SQLite)';
    }
}
