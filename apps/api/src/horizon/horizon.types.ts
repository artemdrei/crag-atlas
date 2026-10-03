import { ApiProperty } from '@nestjs/swagger';

export class HorizonDto {
  @ApiProperty()
  idSector!: string;

  @ApiProperty({
    description: 'False while the sector is queued and no skyline is known yet'
  })
  isReady!: boolean;

  @ApiProperty({ type: Number, required: false, nullable: true })
  elevationM?: number | null;

  @ApiProperty({
    type: Number,
    required: false,
    nullable: true,
    description:
      'Direction the surrounding slope falls away to, 0 = north, clockwise'
  })
  aspectDeg?: number | null;
}

export class HorizonBackfillDto {
  @ApiProperty({ description: 'Sectors this call built a skyline for' })
  built!: number;

  @ApiProperty({
    description: 'Sectors still queued, because one call builds a batch at most'
  })
  remaining!: number;

  @ApiProperty({
    description: 'Sectors the elevation provider had no answer for'
  })
  failed!: number;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Error code of the first sector that failed'
  })
  failureCode!: string | null;
}
