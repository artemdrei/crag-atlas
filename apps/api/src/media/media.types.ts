import { ApiProperty } from '@nestjs/swagger';

import type { GradeScale } from '../common/utils/grade';
import { GRADE_SCALES } from '../common/utils/grade';

export const MEDIA_BUCKET = 'media';

export const MEDIA_KINDS = ['video', 'photo'] as const;

export type MediaKind = (typeof MEDIA_KINDS)[number];

export class MediaDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  idRoute!: string;

  @ApiProperty()
  idUser!: string;

  @ApiProperty({ description: 'Author label; ids carry no meaning' })
  authorName!: string;

  @ApiProperty({ enum: MEDIA_KINDS })
  kind!: MediaKind;

  @ApiProperty()
  url!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ type: Number, required: false, nullable: true })
  durationSeconds?: number | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  channelName?: string | null;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'ISO timestamp the video went up on YouTube'
  })
  publishedAt?: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  idTick?: string | null;

  @ApiProperty({ description: 'ISO timestamp' })
  createdAt!: string;
}

export class CreateMediaDto {
  @ApiProperty({ enum: MEDIA_KINDS })
  kind!: MediaKind;

  @ApiProperty({ type: String, required: false, nullable: true })
  idTick?: string | null;

  @ApiProperty()
  url!: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  title?: string | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  durationSeconds?: number | null;
}

export const VIDEO_SORTS = ['newest', 'oldest'] as const;

export type VideoSort = (typeof VIDEO_SORTS)[number];

export class VideoRouteDto {
  @ApiProperty()
  idRoute!: string;

  @ApiProperty()
  idSector!: string;

  @ApiProperty()
  idRegion!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  nameLocal?: string | null;

  @ApiProperty()
  grade!: string;

  @ApiProperty({ enum: GRADE_SCALES })
  gradeScale!: GradeScale;

  @ApiProperty()
  sectorName!: string;

  @ApiProperty()
  regionName!: string;
}

export class VideoDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  idYoutube!: string;

  @ApiProperty()
  idUser!: string;

  @ApiProperty({ description: 'Author label; ids carry no meaning' })
  authorName!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  channelName?: string | null;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'ISO timestamp the video went up on YouTube'
  })
  publishedAt?: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  idTick?: string | null;

  @ApiProperty({ description: 'ISO timestamp' })
  createdAt!: string;

  @ApiProperty({ type: VideoRouteDto })
  route!: VideoRouteDto;
}

export class VideoPageDto {
  @ApiProperty({ type: [VideoDto] })
  items!: VideoDto[];

  @ApiProperty({ description: 'Videos the filter matches, not just this page' })
  total!: number;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'Pass back as `cursor` to get the next page'
  })
  nextCursor?: string | null;
}

export class VideoPreviewDto {
  @ApiProperty()
  idYoutube!: string;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'Null when YouTube could not be read; the form still works'
  })
  title?: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  channelName?: string | null;

  @ApiProperty({
    type: VideoRouteDto,
    required: false,
    nullable: true,
    description: 'The route the title names, when exactly one matches'
  })
  suggestedRoute?: VideoRouteDto | null;

  @ApiProperty({
    type: VideoDto,
    required: false,
    nullable: true,
    description: 'Set when this video is already in the catalog'
  })
  existing?: VideoDto | null;
}
