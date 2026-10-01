import { ApiProperty } from '@nestjs/swagger';

export class AdminDto {
  @ApiProperty()
  idUser!: string;

  @ApiProperty()
  displayName!: string;

  @ApiProperty({ type: String, required: false, nullable: true })
  avatarUrl?: string | null;

  @ApiProperty()
  email!: string;
}

export class AdminCandidateDto extends AdminDto {
  @ApiProperty()
  isAdmin!: boolean;
}

export class GrantAdminDto {
  @ApiProperty({ type: [String] })
  idUsers!: string[];
}
