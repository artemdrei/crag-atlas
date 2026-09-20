import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/authUser.decorator';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
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
}
