import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { SectorsService } from './sectors.service';
import { SectorDto } from './sectors.types';

// Separate from SectorsController, which is nested under a region — the same
// split routes already use for its single-resource endpoint.
@Controller('sectors')
export class SectorController {
  constructor(private readonly sectorsService: SectorsService) {}

  @Get(':idSector')
  @ApiOkResponse({ type: SectorDto })
  findOne(@Param('idSector') idSector: string): Promise<SectorDto> {
    return this.sectorsService.findOne(idSector);
  }
}
