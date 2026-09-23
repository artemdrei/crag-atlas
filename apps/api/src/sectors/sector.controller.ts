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

  @Post(':idSector/restore')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @ApiOkResponse({ type: SectorDto })
  restore(
    @CurrentUser() authUser: AuthUser,
    @Param('idSector') idSector: string
  ): Promise<SectorDto> {
    return this.sectorsService.restore(authUser, idSector);
  }

  @Get(':idSector/content')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @ApiOkResponse({ type: ClimberContentDto })
  climberContent(
    @Param('idSector') idSector: string
  ): Promise<ClimberContentDto> {
    return this.sectorsService.climberContent(idSector);
  }

  @Delete(':idSector/permanent')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @HttpCode(204)
  @ApiNoContentResponse()
  purge(
    @CurrentUser() authUser: AuthUser,
    @Param('idSector') idSector: string
  ): Promise<void> {
    return this.sectorsService.purge(authUser, idSector);
  }

  @Delete(':idSector')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @HttpCode(204)
  @ApiNoContentResponse()
  remove(
    @CurrentUser() authUser: AuthUser,
    @Param('idSector') idSector: string
  ): Promise<void> {
    return this.sectorsService.remove(authUser, idSector);
  }
}
