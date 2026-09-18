import { Module } from '@nestjs/common';

import { HealthModule } from './health/health.module';
import { RegionsModule } from './regions/regions.module';

@Module({ imports: [HealthModule, RegionsModule] })
export class AppModule {}
