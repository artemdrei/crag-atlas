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

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'First topo photo, used as the card thumbnail'
  })
  photoUrl?: string | null;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  routeCount!: number;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'Derived from the routes of the sector; null when it has none'
  })
  gradeRange?: string | null;
}

export class UpdateSectorDto {
  @ApiProperty()
  name!: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  description?: string | null;
}
