import { ApiProperty } from '@nestjs/swagger';

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
}

export class UpdateRegionDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  province!: string;

  @ApiProperty()
  rockType!: string;
}
