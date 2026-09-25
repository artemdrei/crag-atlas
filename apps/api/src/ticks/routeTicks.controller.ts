import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { TicksService } from './ticks.service';
import { TickDto } from './ticks.types';

@Controller('routes/:idRoute/ticks')
export class RouteTicksController {
  constructor(private readonly ticksService: TicksService) {}

  @Get()
  @ApiOkResponse({ type: [TickDto] })
  findByRoute(@Param('idRoute') idRoute: string): Promise<TickDto[]> {
    return this.ticksService.findByRoute(idRoute);
  }
}
