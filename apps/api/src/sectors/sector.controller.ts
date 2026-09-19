import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/authUser.decorator';
import { AdminGuard } from '../common/guards/admin.guard';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import { SectorsService } from './sectors.service';
import { SectorDto, UpdateSectorDto } from './sectors.types';

// Separate from SectorsController, which is nested under a region — the same
// split routes already use for its single-resource endpoint.
@Controller('sectors')
export class SectorController {
  constructor(private readonly sectorsService: SectorsService) {}

  @Get(':idSector')
  @ApiOkResponse({ type: SectorDto })
  findOne(@Param('idSector') idSector: string): Promise<SectorDto> {
    return this.sectorsService.findOne(idSector);
  }

  @Patch(':idSector')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @ApiOkResponse({ type: SectorDto })
  update(
    @CurrentUser() authUser: AuthUser,
    @Param('idSector') idSector: string,
    @Body() payload: UpdateSectorDto
  ): Promise<SectorDto> {
    return this.sectorsService.update(authUser, idSector, payload);
  }
}
