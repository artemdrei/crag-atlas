import { ApiProperty } from '@nestjs/swagger';

import type { GradeScale } from '../common/utils/grade';
import { GRADE_SCALES } from '../common/utils/grade';

const FRACTION_PAIR = {
  type: 'array',
  items: { type: 'array', items: { type: 'number' } }
} as const;

export class RouteLineDto {
  @ApiProperty()
  idRoute!: string;

  @ApiProperty()
  idTopo!: string;

  @ApiProperty()
  routeName!: string;

  @ApiProperty()
  grade!: string;

  @ApiProperty({
    enum: GRADE_SCALES,
    description: 'System the grade is written in'
  })
  gradeScale!: GradeScale;

  @ApiProperty({
    ...FRACTION_PAIR,
    description:
      '[[x, y], …] as 0..1 fractions of the photo, first point at the start of the route'
  })
  points!: number[][];

  @ApiProperty({
    ...FRACTION_PAIR,
    description: 'Bolt positions as 0..1 fractions of the photo'
  })
  bolts!: number[][];

  @ApiProperty({
    type: 'array',
    items: { type: 'number' },
    required: false,
    nullable: true,
    description: 'The top station, if the route has one'
  })
  anchor?: number[] | null;

  @ApiProperty({ description: 'Nudge of the number marker, 0..1 fractions' })
  labelOffsetX!: number;

  @ApiProperty()
  labelOffsetY!: number;
}

export class TopoDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  photoUrl!: string;

  @ApiProperty({ description: 'Lowest first; the lowest is the sector cover' })
  sortOrder!: number;

  @ApiProperty({
    type: Number,
    required: false,
    nullable: true,
    description:
      'Pixel size of the photo, absent for rows imported before the editor'
  })
  width?: number | null;

  @ApiProperty({ type: Number, required: false, nullable: true })
  height?: number | null;

  @ApiProperty({ type: [RouteLineDto] })
  lines!: RouteLineDto[];
}

export class SaveRouteLineDto {
  @ApiProperty({
    ...FRACTION_PAIR,
    description:
      'Control points as 0..1 fractions, at least two, first one at the start of the route'
  })
  points!: number[][];

  @ApiProperty({ ...FRACTION_PAIR, required: false })
  bolts?: number[][];

  @ApiProperty({
    type: 'array',
    items: { type: 'number' },
    required: false,
    nullable: true
  })
  anchor?: number[] | null;

  @ApiProperty({ type: Number, required: false })
  labelOffsetX?: number;

  @ApiProperty({ type: Number, required: false })
  labelOffsetY?: number;
}

export class UpdateTopoDto {
  @ApiProperty()
  label!: string;
}

export class TopoOrderDto {
  @ApiProperty()
  idTopo!: string;

  @ApiProperty()
  sortOrder!: number;
}

export class ReorderToposDto {
  @ApiProperty({ type: [TopoOrderDto] })
  items!: TopoOrderDto[];
}

/** What multer hands over; `@types/multer` is not installed. */
export interface UploadedPhoto {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}
