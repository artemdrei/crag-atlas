import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';

import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import { WeatherService } from './weather.service';
import { WeatherLookupDto } from './weather.types';

@Controller('weather')
@UseGuards(SupabaseAuthGuard)
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  @ApiOkResponse({ type: WeatherLookupDto })
  @ApiQuery({ name: 'idRoute', description: 'Read at its sector’s point' })
  @ApiQuery({ name: 'at', description: 'Local wall clock, 2026-10-01T16:00' })
  lookup(
    @Query('idRoute') idRoute: string,
    @Query('at') at: string
  ): Promise<WeatherLookupDto> {
    return this.weatherService.lookupByRoute(idRoute, at);
  }
}
