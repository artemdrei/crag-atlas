import { ApiProperty } from '@nestjs/swagger';

export class ClimberContentDto {
  @ApiProperty()
  ascents!: number;

  @ApiProperty()
  comments!: number;

  @ApiProperty()
  media!: number;
}
