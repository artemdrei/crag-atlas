import { Module } from '@nestjs/common';

import { HealthModule } from './health/health.module';
import { RegionsModule } from './regions/regions.module';
import { SectorsModule } from './sectors/sectors.module';

@Module({ imports: [HealthModule, RegionsModule, SectorsModule] })
export class AppModule {}
