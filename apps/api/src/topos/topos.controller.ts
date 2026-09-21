import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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
import { MAX_PHOTO_BYTES, parseDimension } from './topoStorage';
import { ToposService } from './topos.service';
import { ReorderToposDto, TopoDto, type UploadedPhoto } from './topos.types';

@Controller('sectors/:idSector/topos')
export class ToposController {
  constructor(private readonly toposService: ToposService) {}

  @Get()
  @ApiOkResponse({ type: TopoDto, isArray: true })
  findBySector(@Param('idSector') idSector: string): Promise<TopoDto[]> {
    return this.toposService.findBySector(idSector);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard, AdminGuard)
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
        label: { type: 'string' },
        width: { type: 'integer' },
        height: { type: 'integer' }
      }
    }
  })
  @ApiCreatedResponse({ type: TopoDto })
  create(
    @CurrentUser() authUser: AuthUser,
    @Param('idSector') idSector: string,
    @UploadedFile() file: UploadedPhoto,
    @Body() payload: Record<string, string>
  ): Promise<TopoDto> {
    return this.toposService.create(
      authUser,
      idSector,
      file,
      payload.label?.trim() ?? '',
      // Multipart carries strings only, and there is no global ValidationPipe.
      parseDimension(payload.width, 'width'),
      parseDimension(payload.height, 'height')
    );
  }

  @Patch('order')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @ApiOkResponse({ type: TopoDto, isArray: true })
  reorder(
    @CurrentUser() authUser: AuthUser,
    @Param('idSector') idSector: string,
    @Body() payload: ReorderToposDto
  ): Promise<TopoDto[]> {
    return this.toposService.reorder(authUser, idSector, payload);
  }
}
