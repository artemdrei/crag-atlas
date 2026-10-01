import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse, ApiQuery } from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/authUser.decorator';
import { AdminGuard } from '../common/guards/admin.guard';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { SupabaseAuthGuard } from '../common/guards/supabaseAuth.guard';
import { AdminsService } from './admins.service';
import { AdminCandidateDto, AdminDto, GrantAdminDto } from './admins.types';

@Controller('admins')
@UseGuards(SupabaseAuthGuard, AdminGuard)
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  @ApiOkResponse({ type: AdminDto, isArray: true })
  findAll(@CurrentUser() authUser: AuthUser): Promise<AdminDto[]> {
    return this.adminsService.findAll(authUser);
  }

  // Not the public climber search: that one is read by every climber and
  // must never carry an email.
  @Get('candidates')
  @ApiOkResponse({ type: AdminCandidateDto, isArray: true })
  @ApiQuery({ name: 'q', required: false })
  search(
    @CurrentUser() authUser: AuthUser,
    @Query('q') q?: string
  ): Promise<AdminCandidateDto[]> {
    return this.adminsService.search(authUser, q);
  }

  @Post()
  @HttpCode(200)
  @ApiOkResponse({ type: AdminDto, isArray: true })
  grant(
    @CurrentUser() authUser: AuthUser,
    @Body() payload: GrantAdminDto
  ): Promise<AdminDto[]> {
    return this.adminsService.grant(authUser, payload.idUsers);
  }

  @Delete(':idUser')
  @HttpCode(204)
  @ApiNoContentResponse()
  revoke(
    @CurrentUser() authUser: AuthUser,
    @Param('idUser') idUser: string
  ): Promise<void> {
    return this.adminsService.revoke(authUser, idUser);
  }
}
