import { ApiProperty } from '@nestjs/swagger';

export class RouteDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  sectorId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  grade!: string;

  @ApiProperty({ enum: ['sport', 'trad', 'boulder'] })
  type!: 'sport' | 'trad' | 'boulder';

  @ApiProperty()
  length!: number;

  @ApiProperty()
  boltsCount!: number;

  @ApiProperty()
  description!: string;
}
