import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { RoutesService } from './routes.service';
import { RouteDto } from './routes.types';

@Controller('sectors/:idSector/routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  @ApiOkResponse({ type: RouteDto, isArray: true })
  findBySector(@Param('idSector') idSector: string): RouteDto[] {
    return this.routesService.findBySector(idSector);
  }
}
