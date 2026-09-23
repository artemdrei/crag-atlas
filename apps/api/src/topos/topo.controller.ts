import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Put,
  Query,
  UploadedFile,
  UseGuards
} from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/authUser.decorator';
import { PhotoUpload } from '../common/decorators/photoUpload.decorator';
import { AdminGuard } from '../common/guards/admin.guard';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import {
  parseDimension,
  type UploadedPhoto
} from '../common/utils/photoStorage';
import { ToposService } from './topos.service';
import { TopoDto } from './topos.types';

@Controller('topos')
@UseGuards(SupabaseAuthGuard, AdminGuard)
export class TopoController {
  constructor(private readonly toposService: ToposService) {}

  @Put(':idTopo/photo')
  @PhotoUpload('width', 'height')
  @ApiOkResponse({ type: TopoDto })
  replacePhoto(
    @CurrentUser() authUser: AuthUser,
    @Param('idTopo') idTopo: string,
    @UploadedFile() file: UploadedPhoto,
    @Body() payload: Record<string, string>
  ): Promise<TopoDto> {
    return this.toposService.replacePhoto(
      authUser,
      idTopo,
      file,
      parseDimension(payload.width, 'width'),
      parseDimension(payload.height, 'height')
    );
  }

  @Delete(':idTopo')
  @HttpCode(204)
  @ApiNoContentResponse()
  remove(
    @CurrentUser() authUser: AuthUser,
    @Param('idTopo') idTopo: string,
    @Query('force') force?: string
  ): Promise<void> {
    return this.toposService.remove(authUser, idTopo, force === 'true');
  }
}
