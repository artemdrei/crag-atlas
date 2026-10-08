import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import type { GradeScale } from '../common/utils/grade';
import { GRADE_SCALES } from '../common/utils/grade';

export class RouteDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  idSector!: string;

  @ApiProperty({ description: 'Label for breadcrumbs; ids carry no meaning' })
  sectorName!: string;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'Where the weather is read; null when the sector has no pin'
  })
  sectorLat!: number | null;

  @ApiProperty({ type: Number, nullable: true })
  sectorLng!: number | null;

  @ApiProperty()
  idRegion!: string;

  @ApiProperty()
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

  @ApiProperty()
  grade!: string;

  @ApiProperty({
    enum: GRADE_SCALES,
    description:
      'The system the grade is written in; a grade alone is ambiguous'
  })
  gradeScale!: GradeScale;

  @ApiProperty({ enum: ['sport', 'boulder'] })
  type!: 'sport' | 'boulder';

  @ApiProperty({ type: Number, required: false, nullable: true })
  length?: number | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  boltsCount?: number | null;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'The climber who bolted it, when they have an account here'
  })
  idBolter?: string | null;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description:
      'Who bolted it, whether that name came from an account or was typed'
  })
  bolterName?: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  bolterAvatarUrl?: string | null;

  @ApiProperty({
    type: Number,
    required: false,
    nullable: true,
    description: 'The year it was bolted; a guidebook rarely knows the day'
  })
  boltedYear?: number | null;

  @ApiProperty({
    type: Number,
    required: false,
    nullable: true,
    description: 'Community rating, 0..5'
  })
  rating?: number | null;

  @ApiProperty({
    type: Number,
    required: false,
    nullable: true,
    description: 'How many ratings that average stands on'
  })
  ratingVotes?: number | null;

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

  @ApiProperty({ description: 'A photo hangs on this route' })
  hasPhoto!: boolean;

  @ApiProperty({ description: 'A video hangs on this route' })
  hasVideo!: boolean;

  @ApiProperty()
  description!: string;

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

// A full replacement, so any community field listed here would be nulled by a
// client with nothing to send for it.
export class UpdateRouteDto {
  @ApiProperty()
  name!: string;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'The name in its own writing system; null when there is none'
  })
  nameLocal?: string | null;

  @ApiProperty()
  grade!: string;

  @ApiProperty({
    enum: GRADE_SCALES,
    description:
      'The system the grade is written in; a grade alone is ambiguous'
  })
  gradeScale!: GradeScale;

  @ApiProperty({ enum: ['sport', 'boulder'] })
  type!: 'sport' | 'boulder';

  @ApiProperty({ type: Number, required: false, nullable: true })
  length?: number | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  boltsCount?: number | null;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'The climber who bolted it, when they have an account here'
  })
  idBolter?: string | null;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'Who bolted it, when they have no account to point at'
  })
  bolterName?: string | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  boltedYear?: number | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  description?: string | null;
}

export class CreateRouteDto {
  @ApiProperty()
  name!: string;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'The name in its own writing system; null when there is none'
  })
  nameLocal?: string | null;

  @ApiProperty()
  grade!: string;

  @ApiProperty({
    enum: GRADE_SCALES,
    description:
      'The system the grade is written in; a grade alone is ambiguous'
  })
  gradeScale!: GradeScale;

  @ApiProperty({ enum: ['sport', 'boulder'] })
  type!: 'sport' | 'boulder';

  @ApiProperty({ type: Number, required: false, nullable: true })
  length?: number | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  boltsCount?: number | null;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'The climber who bolted it, when they have an account here'
  })
  idBolter?: string | null;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'Who bolted it, when they have no account to point at'
  })
  bolterName?: string | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  boltedYear?: number | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  description?: string | null;
}

export const ROUTE_TYPES: RouteDto['type'][] = ['sport', 'boulder'];

// Bounds arrive as a grade in whatever system the reader thinks in.
export class RouteFilterQuery {
  @ApiPropertyOptional({ enum: ['sport', 'boulder'] })
  type?: 'sport' | 'boulder';

  @ApiPropertyOptional({ description: 'Easiest grade to include' })
  gradeFrom?: string;

  @ApiPropertyOptional({ description: 'Hardest grade to include' })
  gradeTo?: string;

  @ApiPropertyOptional({
    enum: GRADE_SCALES,
    description: 'System the two bounds are written in'
  })
  gradeScale?: GradeScale;
}
