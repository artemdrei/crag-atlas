import { ApiProperty } from '@nestjs/swagger';

export class CommentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  idRoute!: string;

  @ApiProperty()
  idUser!: string;

  @ApiProperty({ description: 'Author label; ids carry no meaning' })
  authorName!: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  avatarUrl?: string | null;

  @ApiProperty()
  body!: string;

  @ApiProperty({ description: 'ISO timestamp' })
  createdAt!: string;
}

export class CreateCommentDto {
  @ApiProperty()
  body!: string;
}
