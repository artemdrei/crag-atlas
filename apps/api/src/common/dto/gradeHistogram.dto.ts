import { ApiProperty } from '@nestjs/swagger';

import type { GradeScale } from '../utils/grade';
import { GRADE_SCALES } from '../utils/grade';

export const CLIMB_TYPES = ['sport', 'trad', 'boulder'] as const;

export type ClimbType = (typeof CLIMB_TYPES)[number];

export class GradeCountDto {
  @ApiProperty()
  grade!: string;

  @ApiProperty({
    enum: GRADE_SCALES,
    description: 'The system this grade is written in; readers convert it'
  })
  scale!: GradeScale;

  @ApiProperty({ description: 'Routes listed at this exact grade' })
  count!: number;
}

export class GradeHistogramGroupDto {
  @ApiProperty({ enum: CLIMB_TYPES })
  type!: ClimbType;

  @ApiProperty({ description: 'Routes of this type; the buckets sum to it' })
  routeCount!: number;

  @ApiProperty({
    type: GradeCountDto,
    isArray: true,
    description: 'Easiest first; mixed scales are possible within one group'
  })
  grades!: GradeCountDto[];
}
