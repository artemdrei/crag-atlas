import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiQuery } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/authUser.decorator';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import { TicksService } from './ticks.service';
import { CreateTickDto, TickDto } from './ticks.types';

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

  @Post()
  @ApiCreatedResponse({ type: TickDto })
  create(
    @CurrentUser() authUser: AuthUser,
    @Body() payload: CreateTickDto
  ): Promise<TickDto> {
    return this.ticksService.create(authUser, payload);
  }
}
