import { ApiProperty } from '@nestjs/swagger';

import type { GradeScale } from '../common/utils/grade';
import { GRADE_SCALES } from '../common/utils/grade';

export const GRADE_OPINIONS = ['soft', 'neutral', 'hard'] as const;

export type GradeOpinion = (typeof GRADE_OPINIONS)[number];

export const ASCENT_TYPES = [
  'onsight',
  'flash',
  'retro_flash',
  'redpoint',
  'toprope',
  'attempt'
] as const;

export type AscentType = (typeof ASCENT_TYPES)[number];

export class TickMediaDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: ['video', 'photo'] })
  kind!: 'video' | 'photo';

  @ApiProperty()
  url!: string;
}

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
    description: 'With idRegion, the pair a link back to the route needs'
  })
  idSector?: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  idRegion?: string | null;

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

  @ApiProperty({ enum: ASCENT_TYPES })
  ascentType!: AscentType;

  @ApiProperty({ description: 'ISO date, e.g. 2026-09-19' })
  climbedAt!: string;

  @ApiProperty({ type: Number, required: false, nullable: true })
  attempts?: number | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  note?: string | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  rating?: number | null;

  @ApiProperty({ enum: GRADE_OPINIONS, required: false, nullable: true })
  gradeOpinion?: GradeOpinion | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  gradeVote?: string | null;

  @ApiProperty({ description: 'A private note is empty for everyone else' })
  notePrivate!: boolean;

  @ApiProperty({ type: String, required: false, nullable: true })
  idPartner?: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  partnerName?: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  authorName?: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  avatarUrl?: string | null;

  @ApiProperty({ type: [TickMediaDto], required: false })
  media?: TickMediaDto[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class CreateTickDto {
  @ApiProperty()
  idRoute!: string;

  @ApiProperty({ enum: ASCENT_TYPES })
  ascentType!: AscentType;

  @ApiProperty({ required: false, description: 'ISO date; defaults to today' })
  climbedAt?: string;

  @ApiProperty({ type: Number, required: false, nullable: true })
  attempts?: number | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  note?: string | null;
  @ApiProperty({ type: Number, required: false, nullable: true })
  rating?: number | null;

  @ApiProperty({ enum: GRADE_OPINIONS, required: false, nullable: true })
  gradeOpinion?: GradeOpinion | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  idPartner?: string | null;
  @ApiProperty({ type: String, required: false, nullable: true })
  gradeVote?: string | null;

  @ApiProperty({ type: Boolean, required: false })
  notePrivate?: boolean;
}

export class UpdateTickDto {
  @ApiProperty({ enum: ASCENT_TYPES, required: false })
  ascentType?: AscentType;

  @ApiProperty({ required: false, description: 'ISO date, e.g. 2026-09-19' })
  climbedAt?: string;

  @ApiProperty({ type: Number, required: false, nullable: true })
  attempts?: number | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  note?: string | null;
  @ApiProperty({ type: Number, required: false, nullable: true })
  rating?: number | null;

  @ApiProperty({ enum: GRADE_OPINIONS, required: false, nullable: true })
  gradeOpinion?: GradeOpinion | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  idPartner?: string | null;
  @ApiProperty({ type: String, required: false, nullable: true })
  gradeVote?: string | null;

  @ApiProperty({ type: Boolean, required: false })
  notePrivate?: boolean;
}

export class TickFeedPageDto {
  @ApiProperty({ type: [TickDto] })
  items!: TickDto[];

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'Pass back as `cursor` to get the next page'
  })
  nextCursor?: string | null;
}
