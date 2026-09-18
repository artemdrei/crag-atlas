import { Module } from '@nestjs/common';

import { HealthModule } from './health/health.module';
import { RegionsModule } from './regions/regions.module';
import { RoutesModule } from './routes/routes.module';
import { SectorsModule } from './sectors/sectors.module';

@Module({
  imports: [HealthModule, RegionsModule, SectorsModule, RoutesModule]
})
export class AppModule {}
