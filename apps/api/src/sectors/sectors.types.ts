import { ApiProperty } from '@nestjs/swagger';

export class SectorDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  idRegion!: string;

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
