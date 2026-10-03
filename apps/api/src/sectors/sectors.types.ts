import { ApiProperty } from '@nestjs/swagger';

import { GradeHistogramGroupDto } from '../common/dto/gradeHistogram.dto';
import type { GradeScale } from '../common/utils/grade';
import { GRADE_SCALES } from '../common/utils/grade';
import type { Shelter } from '../common/utils/shelter';
import { SHELTERS } from '../common/utils/shelter';

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
    description: 'The name in its own writing system; null when there is none'
  })
  nameLocal?: string | null;

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
    description: 'Easiest grade among the routes; null when there are none'
  })
  gradeMin?: string | null;

  @ApiProperty({
    enum: GRADE_SCALES,
    required: false,
    nullable: true,
    description: 'System gradeMin is written in'
  })
  gradeMinScale?: GradeScale | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  gradeMax?: string | null;

  @ApiProperty({
    enum: GRADE_SCALES,
    required: false,
    nullable: true,
    description: 'System gradeMax is written in'
  })
  gradeMaxScale?: GradeScale | null;

  @ApiProperty({
    type: GradeHistogramGroupDto,
    isArray: true,
    description:
      'Grade spread, one group per climbing type; empty when there are no routes'
  })
  gradeHistogram!: GradeHistogramGroupDto[];

  @ApiProperty({ type: Number, required: false, nullable: true })
  lat?: number | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  lng?: number | null;

  @ApiProperty({
    type: Number,
    required: false,
    nullable: true,
    description:
      'Direction the wall faces, 0 = north, clockwise. Null leaves it to the slope the skyline was read from'
  })
  aspectDeg?: number | null;

  @ApiProperty({
    enum: SHELTERS,
    description: 'How much of the rain the wall keeps off a climber'
  })
  shelter!: Shelter;

  @ApiProperty({
    description:
      'Out of the catalog, because it carries the mark or an ancestor does'
  })
  isArchived!: boolean;

  @ApiProperty({
    description:
      'Deleted directly, so restoring this row is what brings it back'
  })
  isDeleted!: boolean;
}

export class SectorTickCountDto {
  @ApiProperty()
  idSector!: string;

  @ApiProperty({ description: 'Routes the climber has ticked in this sector' })
  tickedCount!: number;
}

export class CreateSectorDto {
  @ApiProperty()
  name!: string;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'The name in its own writing system; null when there is none'
  })
  nameLocal?: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  description?: string | null;
}

export class UpdateSectorDto {
  @ApiProperty()
  name!: string;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'The name in its own writing system; null when there is none'
  })
  nameLocal?: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  description?: string | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  lat?: number | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  lng?: number | null;

  @ApiProperty({
    type: Number,
    required: false,
    nullable: true,
    description: 'Overrides the direction read off the surrounding slope'
  })
  aspectDeg?: number | null;

  @ApiProperty({ enum: SHELTERS, required: false })
  shelter?: Shelter;
}
