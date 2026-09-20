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

  @ApiProperty({ type: Number, required: false, nullable: true })
  length?: number | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  boltsCount?: number | null;

  @ApiProperty({
    type: Number,
    required: false,
    nullable: true,
    description: 'Community rating, 0..5'
  })
  rating?: number | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  ascentsCount?: number | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  onsightCount?: number | null;

  @ApiProperty({
    type: Number,
    required: false,
    nullable: true,
    description: 'Votes saying the grade is soft'
  })
  votesSoft?: number | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  votesNeutral?: number | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  votesHard?: number | null;

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

  @ApiProperty({ type: Number, required: false, nullable: true })
  length?: number | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  boltsCount?: number | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  rating?: number | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  description?: string | null;
}
