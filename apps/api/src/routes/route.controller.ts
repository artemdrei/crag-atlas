import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/authUser.decorator';
import { ClimberContentDto } from '../common/dto/climberContent.dto';
import { AdminGuard } from '../common/guards/admin.guard';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import { RoutesService } from './routes.service';
import { RouteDto, UpdateRouteDto } from './routes.types';

@Controller('routes')
export class RouteController {
  constructor(private readonly routesService: RoutesService) {}

  @Get(':idRoute')
  @ApiOkResponse({ type: RouteDto })
  findOne(@Param('idRoute') idRoute: string): Promise<RouteDto> {
    return this.routesService.findOne(idRoute);
  }

  @Patch(':idRoute')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @ApiOkResponse({ type: RouteDto })
  update(
    @CurrentUser() authUser: AuthUser,
    @Param('idRoute') idRoute: string,
    @Body() payload: UpdateRouteDto
  ): Promise<RouteDto> {
    return this.routesService.update(authUser, idRoute, payload);
  }

  @Post(':idRoute/restore')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @ApiOkResponse({ type: RouteDto })
  restore(
    @CurrentUser() authUser: AuthUser,
    @Param('idRoute') idRoute: string
  ): Promise<RouteDto> {
    return this.routesService.restore(authUser, idRoute);
  }

  @Get(':idRoute/content')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @ApiOkResponse({ type: ClimberContentDto })
  climberContent(
    @Param('idRoute') idRoute: string
  ): Promise<ClimberContentDto> {
    return this.routesService.climberContent(idRoute);
  }

  @Delete(':idRoute/permanent')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @HttpCode(204)
  @ApiNoContentResponse()
  purge(
    @CurrentUser() authUser: AuthUser,
    @Param('idRoute') idRoute: string
  ): Promise<void> {
    return this.routesService.purge(authUser, idRoute);
  }

  @Delete(':idRoute')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @HttpCode(204)
  @ApiNoContentResponse()
  remove(
    @CurrentUser() authUser: AuthUser,
    @Param('idRoute') idRoute: string
  ): Promise<void> {
    return this.routesService.remove(authUser, idRoute);
  }
}
