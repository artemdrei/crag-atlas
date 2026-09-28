import { ApiProperty } from '@nestjs/swagger';

export class SearchHitDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  nameLocal?: string | null;

  @ApiProperty({ description: 'The region the hit belongs to, or is' })
  idRegion!: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  idSector?: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  idRoute?: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  regionName?: string | null;

  @ApiProperty({ type: String, required: false, nullable: true })
  sectorName?: string | null;
}

export class CatalogSearchDto {
  @ApiProperty({ type: [SearchHitDto] })
  regions!: SearchHitDto[];

  @ApiProperty({ type: [SearchHitDto] })
  sectors!: SearchHitDto[];

  @ApiProperty({ type: [SearchHitDto] })
  routes!: SearchHitDto[];
}
