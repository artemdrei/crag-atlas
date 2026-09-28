import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import type { BoulderGradeScale, RouteGradeScale } from '../common/utils/grade';
import {
  BOULDER_GRADE_SCALES,
  ROUTE_GRADE_SCALES
} from '../common/utils/grade';

export const AVATARS_BUCKET = 'avatars';

export class MeDto {
  @ApiProperty()
  idUser!: string;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'The picture they uploaded, or the one their provider gave'
  })
  avatarUrl?: string | null;

  @ApiProperty({ description: 'Mirrors the user_roles row the RLS checks' })
  isAdmin!: boolean;

  @ApiProperty({
    enum: ROUTE_GRADE_SCALES,
    description: 'System every route grade is shown in'
  })
  gradeScaleRoute!: RouteGradeScale;

  @ApiProperty({
    enum: BOULDER_GRADE_SCALES,
    description:
      'Boulder grades never convert into route grades, so they pick their own'
  })
  gradeScaleBoulder!: BoulderGradeScale;
}

export class UpdateMeDto {
  @ApiPropertyOptional({ enum: ROUTE_GRADE_SCALES })
  gradeScaleRoute?: RouteGradeScale;

  @ApiPropertyOptional({ enum: BOULDER_GRADE_SCALES })
  gradeScaleBoulder?: BoulderGradeScale;
}
