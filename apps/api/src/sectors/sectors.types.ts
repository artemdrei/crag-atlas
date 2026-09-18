import { ApiProperty } from '@nestjs/swagger';

export class SectorDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  regionId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  approachMinutes!: number;

  @ApiProperty()
  routeCount!: number;

  @ApiProperty()
  gradeRange!: string;
}
