import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse
} from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/authUser.decorator';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import { CommentsService } from './comments.service';
import {
  CommentDto,
  CreateCommentDto,
  UpdateCommentDto
} from './comments.types';

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

  @Patch(':idComment')
  @UseGuards(SupabaseAuthGuard)
  @ApiOkResponse({ type: CommentDto })
  update(
    @CurrentUser() authUser: AuthUser,
    @Param('idComment') idComment: string,
    @Body() payload: UpdateCommentDto
  ): Promise<CommentDto> {
    return this.commentsService.update(authUser, idComment, payload);
  }

  @Delete(':idComment')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(204)
  @ApiNoContentResponse()
  remove(
    @CurrentUser() authUser: AuthUser,
    @Param('idComment') idComment: string
  ): Promise<void> {
    return this.commentsService.remove(authUser, idComment);
  }
}
