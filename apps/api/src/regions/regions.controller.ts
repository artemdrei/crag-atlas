import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse
} from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/authUser.decorator';
import { AdminGuard } from '../common/guards/admin.guard';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import type { UploadedPhoto } from '../common/utils/photoStorage';
import { MAX_PHOTO_BYTES } from '../common/utils/photoStorage';
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
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_PHOTO_BYTES } })
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } }
    }
  })
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
}
