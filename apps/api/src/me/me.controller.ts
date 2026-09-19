import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/authUser.decorator';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import { MeService } from './me.service';
import { MeDto } from './me.types';

@Controller('me')
@UseGuards(SupabaseAuthGuard)
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  @ApiOkResponse({ type: MeDto })
  findMe(@CurrentUser() authUser: AuthUser): Promise<MeDto> {
    return this.meService.findMe(authUser);
  }
}
