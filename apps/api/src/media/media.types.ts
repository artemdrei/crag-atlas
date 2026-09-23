import { ApiProperty } from '@nestjs/swagger';

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
