import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/authUser.decorator';
import { AdminGuard } from '../common/guards/admin.guard';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import { RoutesService } from './routes.service';
import { CreateRouteDto, RouteDto, RouteFilterQuery } from './routes.types';

@Controller('sectors/:idSector/routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  @ApiOkResponse({ type: RouteDto, isArray: true })
  findBySector(
    @Param('idSector') idSector: string,
    @Query() filter: RouteFilterQuery
  ): Promise<RouteDto[]> {
    return this.routesService.findBySector(idSector, filter);
  }

  @Get('archived')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @ApiOkResponse({ type: RouteDto, isArray: true })
  findArchived(@Param('idSector') idSector: string): Promise<RouteDto[]> {
    return this.routesService.findBySector(idSector, {}, true);
  }

  @Get('ticked')
  @UseGuards(SupabaseAuthGuard)
  @ApiOkResponse({ type: String, isArray: true })
  findTicked(
    @CurrentUser() authUser: AuthUser,
    @Param('idSector') idSector: string
  ): Promise<string[]> {
    return this.routesService.findTickedBySector(authUser, idSector);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @ApiCreatedResponse({ type: RouteDto })
  create(
    @CurrentUser() authUser: AuthUser,
    @Param('idSector') idSector: string,
    @Body() payload: CreateRouteDto
  ): Promise<RouteDto> {
    return this.routesService.create(authUser, idSector, payload);
  }
}
