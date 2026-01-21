import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { BountyService } from './bounty.service';

@Controller('bounties')
export class BountyController {
    constructor(private readonly bountyService: BountyService) { }

    @Get()
    findAll() {
        return this.bountyService.findAll();
    }

    @Post()
    create(@Body() data: any) {
        return this.bountyService.create(data);
    }

    @Put(':id/claim')
    claim(@Param('id') id: string, @Body('userId') userId: string) {
        return this.bountyService.claim(id, userId);
    }

    @Put(':id/submit')
    submit(@Param('id') id: string, @Body('evidence') evidence: string) {
        return this.bountyService.submit(id, evidence);
    }

    @Put(':id/complete')
    complete(@Param('id') id: string) {
        return this.bountyService.complete(id);
    }
}
