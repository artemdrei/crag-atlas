import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';

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
import { ReorderToposDto, TopoDto } from './topos.types';

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
  @PhotoUpload('width', 'height')
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
