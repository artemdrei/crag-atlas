import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';

import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import { UsersService } from './users.service';
import { UserSummaryDto } from './users.types';

@Controller('users')
@UseGuards(SupabaseAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOkResponse({ type: [UserSummaryDto] })
  @ApiQuery({ name: 'q', required: false })
  search(@Query('q') q?: string): Promise<UserSummaryDto[]> {
    return this.usersService.search(q);
  }
}
