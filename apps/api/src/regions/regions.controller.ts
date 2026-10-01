import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse
} from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/authUser.decorator';
import { PhotoUpload } from '../common/decorators/photoUpload.decorator';
import { ClimberContentDto } from '../common/dto/climberContent.dto';
import { AdminGuard } from '../common/guards/admin.guard';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import type { UploadedPhoto } from '../common/utils/photoStorage';
import { RegionsService } from './regions.service';
import { CreateRegionDto, RegionDto, UpdateRegionDto } from './regions.types';

@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  @ApiOkResponse({ type: RegionDto, isArray: true })
  findAll(): Promise<RegionDto[]> {
    return this.regionsService.findAll();
  }

  // Its own endpoint: a guard cannot depend on a query parameter.
  @Get('archived')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @ApiOkResponse({ type: RegionDto, isArray: true })
  findArchived(): Promise<RegionDto[]> {
    return this.regionsService.findAll(true);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @ApiCreatedResponse({ type: RegionDto })
  create(
    @CurrentUser() authUser: AuthUser,
    @Body() payload: CreateRegionDto
  ): Promise<RegionDto> {
    return this.regionsService.create(authUser, payload);
  }

  @Get(':idRegion')
  @ApiOkResponse({ type: RegionDto })
  findOne(@Param('idRegion') idRegion: string): Promise<RegionDto> {
    return this.regionsService.findOne(idRegion);
  }

  @Put(':idRegion/photo')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @PhotoUpload()
  @ApiOkResponse({ type: RegionDto })
  replacePhoto(
    @CurrentUser() authUser: AuthUser,
    @Param('idRegion') idRegion: string,
    @UploadedFile() file: UploadedPhoto
  ): Promise<RegionDto> {
    return this.regionsService.replacePhoto(authUser, idRegion, file);
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

  @Post(':idRegion/restore')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @ApiOkResponse({ type: RegionDto })
  restore(
    @CurrentUser() authUser: AuthUser,
    @Param('idRegion') idRegion: string
  ): Promise<RegionDto> {
    return this.regionsService.restore(authUser, idRegion);
  }

  @Get(':idRegion/content')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @ApiOkResponse({ type: ClimberContentDto })
  climberContent(
    @Param('idRegion') idRegion: string
  ): Promise<ClimberContentDto> {
    return this.regionsService.climberContent(idRegion);
  }

  @Delete(':idRegion/permanent')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @HttpCode(204)
  @ApiNoContentResponse()
  purge(
    @CurrentUser() authUser: AuthUser,
    @Param('idRegion') idRegion: string
  ): Promise<void> {
    return this.regionsService.purge(authUser, idRegion);
  }

  @Delete(':idRegion')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @HttpCode(204)
  @ApiNoContentResponse()
  remove(
    @CurrentUser() authUser: AuthUser,
    @Param('idRegion') idRegion: string
  ): Promise<void> {
    return this.regionsService.remove(authUser, idRegion);
  }
}
