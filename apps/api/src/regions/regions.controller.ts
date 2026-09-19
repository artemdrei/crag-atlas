import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/authUser.decorator';
import { AdminGuard } from '../common/guards/admin.guard';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import { RegionsService } from './regions.service';
import { RegionDto, UpdateRegionDto } from './regions.types';

@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  @ApiOkResponse({ type: RegionDto, isArray: true })
  findAll(): Promise<RegionDto[]> {
    return this.regionsService.findAll();
  }

  @Get(':idRegion')
  @ApiOkResponse({ type: RegionDto })
  findOne(@Param('idRegion') idRegion: string): Promise<RegionDto> {
    return this.regionsService.findOne(idRegion);
  }

  @Patch(':idRegion')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @ApiOkResponse({ type: RegionDto })
  update(
    @CurrentUser() authUser: AuthUser,
    @Param('idRegion') idRegion: string,
    @Body() payload: UpdateRegionDto
  ): Promise<RegionDto> {
    return this.regionsService.update(authUser, idRegion, payload);
  }
}
