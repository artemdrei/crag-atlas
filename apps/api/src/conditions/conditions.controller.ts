import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { ConditionsService } from './conditions.service';
import { ConditionsRequestDto, SectorConditionsDto } from './conditions.types';

// POST only because the browser hands over the forecast it fetched; nothing
// is written.
@Controller()
export class ConditionsController {
  constructor(private readonly conditionsService: ConditionsService) {}

  @Post('sectors/:idSector/conditions')
  @HttpCode(200)
  @ApiOkResponse({ type: SectorConditionsDto })
  forSector(
    @Param('idSector') idSector: string,
    @Body() body: ConditionsRequestDto
  ): Promise<SectorConditionsDto> {
    return this.conditionsService.forSector(idSector, body.forecast ?? null);
  }

  @Post('regions/:idRegion/conditions')
  @HttpCode(200)
  @ApiOkResponse({ type: SectorConditionsDto })
  forRegion(
    @Param('idRegion') idRegion: string,
    @Body() body: ConditionsRequestDto
  ): Promise<SectorConditionsDto> {
    return this.conditionsService.forRegion(idRegion, body.forecast ?? null);
  }
}
