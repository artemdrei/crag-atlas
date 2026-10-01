import { Injectable } from '@nestjs/common';

import {
  AppException,
  ValidationException
} from '../common/exceptions/app.exception';
import {
  readFailed,
  writeFailed
} from '../common/exceptions/database.exception';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import { userClient } from '../common/utils/userClient';
import type { AdminCandidateDto, AdminDto } from './admins.types';

interface DirectoryRow {
  id: string;
  display_name: string;
  avatar_url: string | null;
  email: string;
  is_admin: boolean;
}

@Injectable()
export class AdminsService {
  async findAll(authUser: AuthUser): Promise<AdminDto[]> {
    const rows = await this.directory(authUser, null);

    return rows.map(toAdmin);
  }

  async search(
    authUser: AuthUser,
    query?: string
  ): Promise<AdminCandidateDto[]> {
    const term = query?.trim() ?? '';

    if (!term) return [];

    const rows = await this.directory(authUser, term);

    return rows.map((row) => ({ ...toAdmin(row), isAdmin: row.is_admin }));
  }

  async grant(authUser: AuthUser, idUsers: string[]): Promise<AdminDto[]> {
    if (!Array.isArray(idUsers) || idUsers.length === 0) {
      throw new ValidationException('Pick at least one climber');
    }

    const { error } = await userClient(authUser)
      .from('user_roles')
      .upsert(
        idUsers.map((idUser) => ({ id_user: idUser, role: 'admin' })),
        { onConflict: 'id_user', ignoreDuplicates: true }
      );

    if (error) {
      throw writeFailed('Could not grant admin', 'ADMIN_GRANT_FAILED', error);
    }

    return this.findAll(authUser);
  }

  async revoke(authUser: AuthUser, idUser: string): Promise<void> {
    // The delete policy refuses it silently, removing nothing and raising
    // nothing.
    if (idUser === authUser.idUser) {
      throw new AppException(
        'An admin cannot revoke their own access',
        403,
        'ADMIN_SELF_REVOKE'
      );
    }

    const { error } = await userClient(authUser)
      .from('user_roles')
      .delete()
      .eq('id_user', idUser);

    if (error) {
      throw writeFailed('Could not revoke admin', 'ADMIN_REVOKE_FAILED', error);
    }
  }

  private async directory(
    authUser: AuthUser,
    term: string | null
  ): Promise<DirectoryRow[]> {
    const { data, error } = await userClient(authUser).rpc('admin_directory', {
      term
    });

    if (error) {
      throw readFailed('Could not read admins', 'ADMINS_READ_FAILED', error);
    }

    return (data ?? []) as DirectoryRow[];
  }
}

const toAdmin = (row: DirectoryRow): AdminDto => ({
  idUser: row.id,
  displayName: row.display_name,
  avatarUrl: row.avatar_url,
  email: row.email
});
