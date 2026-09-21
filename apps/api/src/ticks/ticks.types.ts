import { ApiProperty } from '@nestjs/swagger';

import type { GradeScale } from '../common/utils/grade';
import { GRADE_SCALES } from '../common/utils/grade';

export const ASCENT_STYLES = [
  'onsight',
  'flash',
  'retro_flash',
  'redpoint',
  'toprope',
  'attempt'
] as const;

export type AscentStyle = (typeof ASCENT_STYLES)[number];

export class TickDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  idUser!: string;

  @ApiProperty()
  idRoute!: string;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'Resolved from the route catalog; null if the route is gone'
  })
  routeName?: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  routeGrade?: string | null;

  @ApiProperty({
    enum: GRADE_SCALES,
    required: false,
    nullable: true,
    description: 'System routeGrade is written in'
  })
  routeGradeScale?: GradeScale | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  sectorName?: string | null;

  @ApiProperty({ enum: ASCENT_STYLES })
  ascentStyle!: AscentStyle;

  @ApiProperty({ description: 'ISO date, e.g. 2026-09-19' })
  climbedAt!: string;

  @ApiProperty({ type: Number, required: false, nullable: true })
  attempts?: number | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  note?: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class CreateTickDto {
  @ApiProperty()
  idRoute!: string;

  @ApiProperty({ enum: ASCENT_STYLES })
  ascentStyle!: AscentStyle;

  @ApiProperty({ required: false, description: 'ISO date; defaults to today' })
  climbedAt?: string;

  @ApiProperty({ type: Number, required: false, nullable: true })
  attempts?: number | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  note?: string | null;
}
