import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { RoutesService } from './routes.service';
import { RouteDto } from './routes.types';

@Controller('routes')
export class RouteController {
  constructor(private readonly routesService: RoutesService) {}

  @Get(':routeId')
  @ApiOkResponse({ type: RouteDto })
  findOne(@Param('routeId') routeId: string): RouteDto {
    return this.routesService.findOne(routeId);
  }
}
