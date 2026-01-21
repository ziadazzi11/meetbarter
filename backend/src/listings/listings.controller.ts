import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ContentModerationGuard } from '../common/guards/content-moderation.guard';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) { }

  @Post()
  @UseGuards(ContentModerationGuard)
  create(@Body() createListingDto: any) {
    return this.listingsService.create(createListingDto);
  }

  @Get()
  findAll(
    @Query('location') location: string,
    @Query('country') country: string,
  ) {
    return this.listingsService.findAll(location, country);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateListingDto: any) {
    return this.listingsService.update(+id, updateListingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.listingsService.remove(+id);
  }
}
