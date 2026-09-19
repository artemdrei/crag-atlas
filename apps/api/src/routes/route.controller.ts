import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { RoutesService } from './routes.service';
import { RouteDto } from './routes.types';

@Controller('routes')
export class RouteController {
  constructor(private readonly routesService: RoutesService) {}

  @Get(':idRoute')
  @ApiOkResponse({ type: RouteDto })
  findOne(@Param('idRoute') idRoute: string): Promise<RouteDto> {
    return this.routesService.findOne(idRoute);
  }
}
