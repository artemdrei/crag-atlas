import { ApiProperty } from '@nestjs/swagger';

export class SectorQrDto {
  @ApiProperty()
  idSector!: string;

  @ApiProperty()
  idRegion!: string;

  @ApiProperty()
  regionName!: string;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'ISO country code; a region without one cannot get a QR path'
  })
  country?: string | null;

  @ApiProperty()
  sectorName!: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  sectorNameLocal?: string | null;

  @ApiProperty({ description: 'The sector or its region is archived' })
  isArchived!: boolean;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    description: 'The `country/region/sector` path printed now; null when none'
  })
  path?: string | null;

  @ApiProperty({
    type: [String],
    description: 'Earlier paths, still resolving for plaques already printed'
  })
  oldPaths!: string[];
}

export class CreateQrPathsDto {
  @ApiProperty({ type: [String] })
  idSectors!: string[];
}

export class SetQrSlugDto {
  @ApiProperty({ description: 'The sector part of the path' })
  slug!: string;
}

export class QrPathTargetDto {
  @ApiProperty()
  idRegion!: string;

  @ApiProperty()
  idSector!: string;

  @ApiProperty()
  regionName!: string;

  @ApiProperty()
  sectorName!: string;
}
