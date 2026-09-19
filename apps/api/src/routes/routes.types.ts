import { ApiProperty } from '@nestjs/swagger';

export class RouteDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  idSector!: string;

  @ApiProperty({ description: 'Label for breadcrumbs; ids carry no meaning' })
  sectorName!: string;

  @ApiProperty()
  idRegion!: string;

  @ApiProperty()
  regionName!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  grade!: string;

  @ApiProperty({ enum: ['sport', 'trad', 'boulder'] })
  type!: 'sport' | 'trad' | 'boulder';

  @ApiProperty({ required: false, nullable: true })
  length?: number | null;

  @ApiProperty({ required: false, nullable: true })
  boltsCount?: number | null;

  @ApiProperty()
  description!: string;
}

export class UpdateRouteDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  grade!: string;

  @ApiProperty({ enum: ['sport', 'trad', 'boulder'] })
  type!: 'sport' | 'trad' | 'boulder';

  @ApiProperty({ required: false, nullable: true })
  length?: number | null;

  @ApiProperty({ required: false, nullable: true })
  boltsCount?: number | null;

  @ApiProperty({ required: false, nullable: true })
  description?: string | null;
}
