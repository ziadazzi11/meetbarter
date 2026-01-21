
import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { SuccessionService } from './succession.service';

@Controller('succession')
export class SuccessionController {
    constructor(private successionService: SuccessionService) { }

    @Post('seed-gia')
    seedGia(@Body() body: { parentId: string }) {
        return this.successionService.ensureGiaExists(body.parentId);
    }

    @Get(':id/status')
    getStatus(@Param('id') id: string) {
        return this.successionService.checkStatus(id);
    }
}
