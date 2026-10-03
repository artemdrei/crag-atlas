import { Controller, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { ApiAcceptedResponse, ApiOkResponse } from '@nestjs/swagger';

import { AdminGuard } from '../common/guards/admin.guard';
import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import { HorizonService } from './horizon.service';
import { HorizonBackfillDto } from './horizon.types';

// Its own prefix rather than a branch of `/sectors`, so a literal segment is
// never weighed against `:idSector`.
@Controller('horizon')
@UseGuards(SupabaseAuthGuard, AdminGuard)
export class HorizonController {
  constructor(private readonly horizonService: HorizonService) {}

  @Post('backfill')
  @ApiOkResponse({ type: HorizonBackfillDto })
  backfill(): Promise<HorizonBackfillDto> {
    return this.horizonService.backfill();
  }

  // Accepted, not done: the skyline is built after the answer, and the queued
  // row is what says whether it ever was.
  @Post(':idSector/recompute')
  @HttpCode(202)
  @ApiAcceptedResponse()
  recompute(@Param('idSector') idSector: string): Promise<void> {
    return this.horizonService.queueAndBuild(idSector);
  }
}
