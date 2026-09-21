import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Put,
  UseGuards
} from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/authUser.decorator';
import { AdminGuard } from '../common/guards/admin.guard';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import { RouteLinesService } from './routeLines.service';
import { RouteLineDto, SaveRouteLineDto } from './topos.types';

@Controller('routes/:idRoute/topos/:idTopo/line')
@UseGuards(SupabaseAuthGuard, AdminGuard)
export class RouteLineController {
  constructor(private readonly routeLinesService: RouteLinesService) {}

  @Put()
  @ApiOkResponse({ type: RouteLineDto })
  save(
    @CurrentUser() authUser: AuthUser,
    @Param('idRoute') idRoute: string,
    @Param('idTopo') idTopo: string,
    @Body() payload: SaveRouteLineDto
  ): Promise<RouteLineDto> {
    return this.routeLinesService.save(authUser, idRoute, idTopo, payload);
  }

  @Delete()
  @HttpCode(204)
  @ApiNoContentResponse()
  remove(
    @CurrentUser() authUser: AuthUser,
    @Param('idRoute') idRoute: string,
    @Param('idTopo') idTopo: string
  ): Promise<void> {
    return this.routeLinesService.remove(authUser, idRoute, idTopo);
  }
}
