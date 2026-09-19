import { ApiProperty } from '@nestjs/swagger';

export class MeDto {
  @ApiProperty()
  idUser!: string;

  @ApiProperty({ description: 'Mirrors the user_roles row the RLS checks' })
  isAdmin!: boolean;
}
