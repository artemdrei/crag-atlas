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

  @ApiProperty({ type: String, required: false, nullable: true })
  regionName?: string | null;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: "ISO 3166-1 alpha-2 code of the region's country"
  })
  regionCountry?: string | null;

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

  // The three below describe the route, not the ascent. Only the logbook and
  // the feed (GET /ticks, GET /ticks/feed) carry them, because only their
  // cards show them; every other response leaves them out rather than paying
  // for a second query nobody reads.
  @ApiProperty({
    type: Number,
    required: false,
    nullable: true,
    description: 'What the community makes of the route, 0..5'
  })
  routeRating?: number | null;

  @ApiProperty({ required: false })
  routeHasPhoto?: boolean;

  @ApiProperty({ required: false })
  routeHasVideo?: boolean;

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

export const TICK_SORTS = ['date', 'grade'] as const;

export type TickSort = (typeof TICK_SORTS)[number];

export const DISCIPLINES = ['sport', 'boulder'] as const;

export type Discipline = (typeof DISCIPLINES)[number];

export class TickPageDto {
  @ApiProperty({ type: [TickDto] })
  items!: TickDto[];

  @ApiProperty({
    description: 'Ascents the filter matches, not just this page'
  })
  total!: number;

  @ApiProperty({
    type: Number,
    required: false,
    nullable: true,
    description: 'Pass back as `offset` to get the next page; null when done'
  })
  nextOffset?: number | null;
}

export class TickGradeCountDto {
  @ApiProperty()
  grade!: string;

  @ApiProperty({ enum: GRADE_SCALES })
  scale!: GradeScale;

  @ApiProperty({ enum: ASCENT_TYPES })
  ascentType!: AscentType;

  @ApiProperty()
  count!: number;
}

export class TickStatsDto {
  @ApiProperty({ description: 'Every sport ascent, whatever the list shows' })
  sportCount!: number;

  @ApiProperty()
  boulderCount!: number;

  @ApiProperty({ type: [TickGradeCountDto] })
  grades!: TickGradeCountDto[];
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
