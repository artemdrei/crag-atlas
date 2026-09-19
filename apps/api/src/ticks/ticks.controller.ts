import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/authUser.decorator';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import { TicksService } from './ticks.service';
import { CreateTickDto, TickDto } from './ticks.types';

@Controller('ticks')
@UseGuards(SupabaseAuthGuard)
export class TicksController {
  constructor(private readonly ticksService: TicksService) {}

  @Post()
  @ApiCreatedResponse({ type: TickDto })
  create(
    @CurrentUser() authUser: AuthUser,
    @Body() payload: CreateTickDto
  ): Promise<TickDto> {
    return this.ticksService.create(authUser, payload);
  }
}
