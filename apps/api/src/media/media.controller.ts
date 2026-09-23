import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/authUser.decorator';
import { PhotoUpload } from '../common/decorators/photoUpload.decorator';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import type { UploadedPhoto } from '../common/utils/photoStorage';
import { MediaService } from './media.service';
import { CreateMediaDto, MediaDto } from './media.types';

@Controller('routes/:idRoute/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @ApiOkResponse({ type: [MediaDto] })
  findByRoute(@Param('idRoute') idRoute: string): Promise<MediaDto[]> {
    return this.mediaService.findByRoute(idRoute);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @ApiCreatedResponse({ type: MediaDto })
  create(
    @CurrentUser() authUser: AuthUser,
    @Param('idRoute') idRoute: string,
    @Body() payload: CreateMediaDto
  ): Promise<MediaDto> {
    return this.mediaService.create(authUser, idRoute, payload);
  }

  @Post('photo')
  @UseGuards(SupabaseAuthGuard)
  @PhotoUpload()
  @ApiCreatedResponse({ type: MediaDto })
  createPhoto(
    @CurrentUser() authUser: AuthUser,
    @Param('idRoute') idRoute: string,
    @UploadedFile() file: UploadedPhoto,
    @Query('idTick') idTick?: string
  ): Promise<MediaDto> {
    return this.mediaService.createPhoto(authUser, idRoute, file, idTick);
  }
}
