import { ApiProperty } from '@nestjs/swagger';

import { TEXT_LIMITS } from '../common/utils/textLimits';

export class CreateFeedbackDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  rating!: number;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    maxLength: TEXT_LIMITS.feedbackMessage
  })
  message?: string | null;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    maxLength: TEXT_LIMITS.email,
    description: 'A guest may leave an address for a reply'
  })
  email?: string | null;

  @ApiProperty({ required: false, description: 'The page it was written on' })
  url?: string;

  @ApiProperty({ required: false })
  appVersion?: string;

  @ApiProperty({ required: false })
  platform?: string;
}

export class FeedbackPageDto {
  @ApiProperty({ type: () => [FeedbackDto] })
  items!: FeedbackDto[];

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'Pass back as `cursor` to get the next page'
  })
  nextCursor?: string | null;
}

export class FeedbackDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ type: String, nullable: true })
  idUser!: string | null;

  @ApiProperty({ type: String, nullable: true })
  authorName!: string | null;

  @ApiProperty({ type: String, nullable: true })
  avatarUrl!: string | null;

  @ApiProperty({ type: String, nullable: true })
  email!: string | null;

  @ApiProperty({ minimum: 1, maximum: 5 })
  rating!: number;

  @ApiProperty({ type: String, nullable: true })
  message!: string | null;

  @ApiProperty()
  url!: string;

  @ApiProperty()
  appVersion!: string;

  @ApiProperty()
  platform!: string;

  @ApiProperty({ description: 'ISO timestamp' })
  createdAt!: string;
}
