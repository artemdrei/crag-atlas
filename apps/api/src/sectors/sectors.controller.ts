import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/authUser.decorator';
import { AdminGuard } from '../common/guards/admin.guard';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import { SectorsService } from './sectors.service';
import { CreateSectorDto, SectorDto } from './sectors.types';

@Controller('regions/:idRegion/sectors')
export class SectorsController {
  constructor(private readonly sectorsService: SectorsService) {}

  @Get()
  @ApiOkResponse({ type: SectorDto, isArray: true })
  findByRegion(@Param('idRegion') idRegion: string): Promise<SectorDto[]> {
    return this.sectorsService.findByRegion(idRegion);
  }

  @Get('archived')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @ApiOkResponse({ type: SectorDto, isArray: true })
  findArchived(@Param('idRegion') idRegion: string): Promise<SectorDto[]> {
    return this.sectorsService.findByRegion(idRegion, true);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @ApiCreatedResponse({ type: SectorDto })
  create(
    @CurrentUser() authUser: AuthUser,
    @Param('idRegion') idRegion: string,
    @Body() payload: CreateSectorDto
  ): Promise<SectorDto> {
    return this.sectorsService.create(authUser, idRegion, payload);
  }
}
