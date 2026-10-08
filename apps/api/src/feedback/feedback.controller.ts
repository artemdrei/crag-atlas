import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

import { CurrentUser } from '../common/decorators/authUser.decorator';
import { AdminGuard } from '../common/guards/admin.guard';
import type { OptionalAuthRequest } from '../common/guards/optionalAuth.guard';
import { OptionalAuthGuard } from '../common/guards/optionalAuth.guard';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto, FeedbackPageDto } from './feedback.types';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get()
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @ApiOkResponse({ type: FeedbackPageDto })
  @ApiQuery({ name: 'cursor', required: false })
  findPage(
    @CurrentUser() authUser: AuthUser,
    @Query('cursor') cursor?: string
  ): Promise<FeedbackPageDto> {
    return this.feedbackService.findPage(authUser, cursor);
  }

  @Post()
  @UseGuards(ThrottlerGuard, OptionalAuthGuard)
  @HttpCode(204)
  @ApiNoContentResponse()
  create(
    @Req() request: OptionalAuthRequest,
    @Body() payload: CreateFeedbackDto
  ): Promise<void> {
    return this.feedbackService.create(
      payload,
      request.authUser ?? null,
      request.authEmail
    );
  }

  @Delete(':idFeedback')
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @HttpCode(204)
  @ApiNoContentResponse()
  remove(
    @CurrentUser() authUser: AuthUser,
    @Param('idFeedback') idFeedback: string
  ): Promise<void> {
    return this.feedbackService.remove(authUser, idFeedback);
  }
}
