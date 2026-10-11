import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';

import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import {
  VIDEO_SORTS,
  VideoPageDto,
  VideoPreviewDto,
  type VideoSort
} from './media.types';
import { VideosService } from './videos.service';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  @ApiOkResponse({ type: VideoPageDto })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'gradeFrom', required: false, description: 'French grade' })
  @ApiQuery({ name: 'gradeTo', required: false, description: 'French grade' })
  @ApiQuery({ name: 'sort', required: false, enum: VIDEO_SORTS })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findPage(
    @Query('query') query?: string,
    @Query('gradeFrom') gradeFrom?: string,
    @Query('gradeTo') gradeTo?: string,
    @Query('sort') sort?: VideoSort,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string
  ): Promise<VideoPageDto> {
    return this.videosService.findPage({
      query,
      gradeFrom,
      gradeTo,
      sort,
      cursor,
      limit: Number(limit) || undefined
    });
  }

  @Get('preview')
  @UseGuards(SupabaseAuthGuard)
  @ApiOkResponse({ type: VideoPreviewDto })
  @ApiQuery({ name: 'url' })
  preview(@Query('url') url: string): Promise<VideoPreviewDto> {
    return this.videosService.preview(url);
  }
}
