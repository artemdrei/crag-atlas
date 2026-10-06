import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiQuery } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/authUser.decorator';
import { AdminGuard } from '../common/guards/admin.guard';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import { QrPathsService } from './qrPaths.service';
import {
  CreateQrPathsDto,
  QrPathTargetDto,
  SectorQrDto,
  SetQrSlugDto
} from './qrPaths.types';

@Controller('qr-paths')
export class QrPathsController {
  constructor(private readonly qrPathsService: QrPathsService) {}

  @Get('resolve')
  @ApiQuery({ name: 'path', description: '`country/region/sector`' })
  @ApiOkResponse({ type: QrPathTargetDto })
  resolve(@Query('path') path: string): Promise<QrPathTargetDto> {
    return this.qrPathsService.resolve(path);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @ApiQuery({ name: 'idRegion', required: false })
  @ApiQuery({ name: 'idSector', required: false })
  @ApiOkResponse({ type: SectorQrDto, isArray: true })
  list(
    @CurrentUser() authUser: AuthUser,
    @Query('idRegion') idRegion?: string,
    @Query('idSector') idSector?: string
  ): Promise<SectorQrDto[]> {
    return this.qrPathsService.list(authUser, { idRegion, idSector });
  }

  @Post()
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @ApiCreatedResponse({ type: SectorQrDto, isArray: true })
  create(
    @CurrentUser() authUser: AuthUser,
    @Body() payload: CreateQrPathsDto
  ): Promise<SectorQrDto[]> {
    return this.qrPathsService.create(authUser, payload.idSectors ?? []);
  }

  @Put('sectors/:idSector')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @ApiOkResponse({ type: SectorQrDto })
  setSlug(
    @CurrentUser() authUser: AuthUser,
    @Param('idSector') idSector: string,
    @Body() payload: SetQrSlugDto
  ): Promise<SectorQrDto> {
    return this.qrPathsService.setSlug(authUser, idSector, payload.slug);
  }
}
