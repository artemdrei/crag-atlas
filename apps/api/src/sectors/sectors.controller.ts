import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { SectorsService } from './sectors.service';
import { SectorDto } from './sectors.types';

@Controller('regions/:regionId/sectors')
export class SectorsController {
  constructor(private readonly sectorsService: SectorsService) {}

  @Get()
  @ApiOkResponse({ type: SectorDto, isArray: true })
  findByRegion(@Param('regionId') regionId: string): SectorDto[] {
    return this.sectorsService.findByRegion(regionId);
  }
}
