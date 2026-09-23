import { ApiProperty } from '@nestjs/swagger';

import { GradeHistogramGroupDto } from '../common/dto/gradeHistogram.dto';
import type { GradeScale } from '../common/utils/grade';
import { GRADE_SCALES } from '../common/utils/grade';

export class RegionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  province!: string;

  @ApiProperty()
  rockType!: string;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'Cover photo; null until an admin uploads one'
  })
  photoUrl?: string | null;

  @ApiProperty()
  sectorCount!: number;

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

export class CreateRegionDto {
  @ApiProperty()
  name!: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  province?: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  rockType?: string | null;
}

export class UpdateRegionDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  province!: string;

  @ApiProperty()
  rockType!: string;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'Cover photo; null until an admin uploads one'
  })
  photoUrl?: string | null;
}
