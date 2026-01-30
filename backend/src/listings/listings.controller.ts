import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ServiceUnavailableException } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { SystemStateService } from '../system-state/system-state.service';
import { ContentModerationGuard } from '../common/guards/content-moderation.guard';
import { Throttle } from '@nestjs/throttler';
import { IsString, IsNumber, IsOptional, MaxLength } from 'class-validator';

class CreateListingDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  @MaxLength(1000)
  description: string;

  @IsNumber()
  priceVP: number;

  @IsString()
  categoryId: string;

  @IsString()
  sellerId: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  images?: string;

  @IsOptional()
  @IsNumber()
  originalPrice?: number;

  @IsOptional()
  @IsString()
  condition?: string;
}

class UpdateListingDto {
  @IsOptional() @IsString() @MaxLength(100) title?: string;
  @IsOptional() @IsString() @MaxLength(1000) description?: string;
  @IsOptional() @IsNumber() priceVP?: number;
  @IsOptional() @IsString() status?: string;
}

@Controller('listings')
export class ListingsController {
  constructor(
    private readonly listingsService: ListingsService,
    private readonly systemState: SystemStateService
  ) { }

  @Post()
  @UseGuards(ContentModerationGuard)
  create(@Body() createListingDto: CreateListingDto) {
    if (this.systemState.getKillSwitches().disableUploads) {
      throw new ServiceUnavailableException('Listing creation is currently disabled.');
    }
    return this.listingsService.create(createListingDto);
  }

  @Get()
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // Stricter limit for search signals
  findAll(@Query() query: any) {
    return this.listingsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateListingDto: UpdateListingDto) {
    return this.listingsService.update(id, updateListingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.listingsService.remove(id);
  }
}
