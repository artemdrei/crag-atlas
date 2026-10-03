import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { ConditionsService } from './conditions.service';
import { SectorConditionsDto } from './conditions.types';

@Controller()
export class ConditionsController {
  constructor(private readonly conditionsService: ConditionsService) {}

  @Get('sectors/:idSector/conditions')
  @ApiOkResponse({ type: SectorConditionsDto })
  forSector(@Param('idSector') idSector: string): Promise<SectorConditionsDto> {
    return this.conditionsService.forSector(idSector);
  }

  @Get('regions/:idRegion/conditions')
  @ApiOkResponse({ type: SectorConditionsDto })
  forRegion(@Param('idRegion') idRegion: string): Promise<SectorConditionsDto> {
    return this.conditionsService.forRegion(idRegion);
  }
}
