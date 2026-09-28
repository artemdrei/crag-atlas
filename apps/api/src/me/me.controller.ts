import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Put,
  UploadedFile,
  UseGuards
} from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/authUser.decorator';
import { PhotoUpload } from '../common/decorators/photoUpload.decorator';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import type { UploadedPhoto } from '../common/utils/photoStorage';
import { MeService } from './me.service';
import { MeDto, UpdateMeDto } from './me.types';

@Controller('me')
@UseGuards(SupabaseAuthGuard)
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  @ApiOkResponse({ type: MeDto })
  findMe(@CurrentUser() authUser: AuthUser): Promise<MeDto> {
    return this.meService.findMe(authUser);
  }

  @Patch()
  @ApiOkResponse({ type: MeDto })
  update(
    @CurrentUser() authUser: AuthUser,
    @Body() payload: UpdateMeDto
  ): Promise<MeDto> {
    return this.meService.update(authUser, payload);
  }

  @Put('photo')
  @PhotoUpload()
  @ApiOkResponse({ type: MeDto })
  replacePhoto(
    @CurrentUser() authUser: AuthUser,
    @UploadedFile() file: UploadedPhoto
  ): Promise<MeDto> {
    return this.meService.replacePhoto(authUser, file);
  }

  @Delete('photo')
  @HttpCode(204)
  @ApiNoContentResponse()
  removePhoto(@CurrentUser() authUser: AuthUser): Promise<void> {
    return this.meService.removePhoto(authUser);
  }
}
