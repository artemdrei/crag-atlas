import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { ToposService } from './topos.service';
import { TopoDto } from './topos.types';

@Controller('sectors/:idSector/topos')
export class ToposController {
  constructor(private readonly toposService: ToposService) {}

  @Get()
  @ApiOkResponse({ type: TopoDto, isArray: true })
  findBySector(@Param('idSector') idSector: string): Promise<TopoDto[]> {
    return this.toposService.findBySector(idSector);
  }
}
