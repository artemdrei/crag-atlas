import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiNoContentResponse,
  ApiOkResponse
} from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/authUser.decorator';
import { AdminGuard } from '../common/guards/admin.guard';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import {
  MAX_PHOTO_BYTES,
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
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_PHOTO_BYTES } })
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'width', 'height'],
      properties: {
        file: { type: 'string', format: 'binary' },
        width: { type: 'integer' },
        height: { type: 'integer' }
      }
    }
  })
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
