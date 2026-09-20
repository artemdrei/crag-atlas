import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/authUser.decorator';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import { CommentsService } from './comments.service';
import { CommentDto, CreateCommentDto } from './comments.types';

@Controller('routes/:idRoute/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOkResponse({ type: [CommentDto] })
  findByRoute(@Param('idRoute') idRoute: string): Promise<CommentDto[]> {
    return this.commentsService.findByRoute(idRoute);
  }

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @ApiCreatedResponse({ type: CommentDto })
  create(
    @CurrentUser() authUser: AuthUser,
    @Param('idRoute') idRoute: string,
    @Body() payload: CreateCommentDto
  ): Promise<CommentDto> {
    return this.commentsService.create(authUser, idRoute, payload);
  }
}
