import { ApiProperty } from '@nestjs/swagger';

export class RouteLineDto {
  @ApiProperty()
  idRoute!: string;

  @ApiProperty()
  routeName!: string;

  @ApiProperty()
  grade!: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'array', items: { type: 'number' } },
    description: '[[x, y], …] as 0..1 fractions of the photo'
  })
  points!: number[][];
}

export class TopoDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  photoUrl!: string;

  @ApiProperty({ type: [RouteLineDto] })
  lines!: RouteLineDto[];
}
