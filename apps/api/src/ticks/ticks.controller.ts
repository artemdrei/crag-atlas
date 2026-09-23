import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiQuery
} from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/authUser.decorator';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import { TicksService } from './ticks.service';
import {
  CreateTickDto,
  TickDto,
  TickFeedPageDto,
  UpdateTickDto
} from './ticks.types';

@Controller('ticks')
@UseGuards(SupabaseAuthGuard)
export class TicksController {
  constructor(private readonly ticksService: TicksService) {}

  @Get()
  @ApiOkResponse({ type: [TickDto] })
  @ApiQuery({ name: 'idRoute', required: false })
  findMine(
    @CurrentUser() authUser: AuthUser,
    @Query('idRoute') idRoute?: string
  ): Promise<TickDto[]> {
    return this.ticksService.findMine(authUser, idRoute);
  }

  @Get('feed')
  @ApiOkResponse({ type: TickFeedPageDto })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'cursor', required: false })
  findFeed(
    @CurrentUser() authUser: AuthUser,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string
  ): Promise<TickFeedPageDto> {
    return this.ticksService.findFeed(authUser, Number(limit), cursor);
  }

  @Post()
  @ApiCreatedResponse({ type: TickDto })
  create(
    @CurrentUser() authUser: AuthUser,
    @Body() payload: CreateTickDto
  ): Promise<TickDto> {
    return this.ticksService.create(authUser, payload);
  }

  @Patch(':idTick')
  @ApiOkResponse({ type: TickDto })
  update(
    @CurrentUser() authUser: AuthUser,
    @Param('idTick') idTick: string,
    @Body() payload: UpdateTickDto
  ): Promise<TickDto> {
    return this.ticksService.update(authUser, idTick, payload);
  }

  @Delete(':idTick')
  @HttpCode(204)
  @ApiNoContentResponse()
  remove(
    @CurrentUser() authUser: AuthUser,
    @Param('idTick') idTick: string
  ): Promise<void> {
    return this.ticksService.remove(authUser, idTick);
  }
}
