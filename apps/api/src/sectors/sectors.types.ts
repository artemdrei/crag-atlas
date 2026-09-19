import { ApiProperty } from '@nestjs/swagger';

export class SectorDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  idRegion!: string;

  @ApiProperty({ description: 'Label for breadcrumbs; ids carry no meaning' })
  regionName!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty({ required: false, nullable: true })
  approachMinutes?: number | null;

  @ApiProperty()
  routeCount!: number;

  @ApiProperty()
  gradeRange!: string;
}
