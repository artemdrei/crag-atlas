import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { RegionsService } from './regions.service';
import { RegionDto } from './regions.types';

@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  @ApiOkResponse({ type: RegionDto, isArray: true })
  findAll(): Promise<RegionDto[]> {
    return this.regionsService.findAll();
  }

  @Get(':idRegion')
  @ApiOkResponse({ type: RegionDto })
  findOne(@Param('idRegion') idRegion: string): Promise<RegionDto> {
    return this.regionsService.findOne(idRegion);
  }
}
