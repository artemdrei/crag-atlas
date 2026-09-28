import { Injectable } from '@nestjs/common';

import { ValidationException } from '../common/exceptions/app.exception';
import { writeFailed } from '../common/exceptions/database.exception';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import type { BoulderGradeScale, RouteGradeScale } from '../common/utils/grade';
import {
  DEFAULT_BOULDER_GRADE_SCALE,
  DEFAULT_ROUTE_GRADE_SCALE,
  isBoulderGradeScale,
  isRouteGradeScale
} from '../common/utils/grade';
import {
  assertWebp,
  buildPhotoPath,
  removePhoto,
  type UploadedPhoto,
  uploadPhoto
} from '../common/utils/photoStorage';
import { userClient } from '../common/utils/userClient';
import { storagePublicUrl } from '../config/supabase.client';
import type { MeDto, UpdateMeDto } from './me.types';
import { AVATARS_BUCKET } from './me.types';

interface PreferencesRow {
  avatar_url: string | null;
  avatar_path: string | null;
  grade_scale_route: RouteGradeScale;
  grade_scale_boulder: BoulderGradeScale;
}

@Injectable()
export class MeService {
  async findMe(authUser: AuthUser): Promise<MeDto> {
    const client = userClient(authUser);

    // Asking as the user: the select policy only ever returns their own row,
    // so a missing row and "not an admin" are the same answer.
    const [{ data }, { data: preferences }] = await Promise.all([
      client
        .from('user_roles')
        .select('role')
        .eq('role', 'admin')
        .maybeSingle(),
      client
        .from('users')
        .select(
          'avatar_url, avatar_path, grade_scale_route, grade_scale_boulder'
        )
        .eq('id', authUser.idUser)
        .maybeSingle<PreferencesRow>()
    ]);

    return {
      idUser: authUser.idUser,
      avatarUrl: preferences?.avatar_url ?? null,
      isAdmin: !!data,
      gradeScaleRoute:
        preferences?.grade_scale_route ?? DEFAULT_ROUTE_GRADE_SCALE,
      gradeScaleBoulder:
        preferences?.grade_scale_boulder ?? DEFAULT_BOULDER_GRADE_SCALE
    };
  }

  async update(authUser: AuthUser, payload: UpdateMeDto): Promise<MeDto> {
    const updates: Record<string, string> = {};

    if ('gradeScaleRoute' in payload) {
      updates.grade_scale_route = routeScale(payload.gradeScaleRoute);
    }

    if ('gradeScaleBoulder' in payload) {
      updates.grade_scale_boulder = boulderScale(payload.gradeScaleBoulder);
    }

    if (Object.keys(updates).length === 0) {
      return this.findMe(authUser);
    }

    const { error } = await userClient(authUser)
      .from('users')
      .update(updates)
      .eq('id', authUser.idUser);

    if (error) {
      throw writeFailed(
        'Could not save your settings',
        'ME_UPDATE_FAILED',
        error
      );
    }

    return this.findMe(authUser);
  }

  async replacePhoto(authUser: AuthUser, photo: UploadedPhoto): Promise<MeDto> {
    assertWebp(photo);

    const client = userClient(authUser);
    const path = buildPhotoPath(authUser.idUser);
    const previous = await currentAvatarPath(client, authUser);

    await uploadPhoto(client, AVATARS_BUCKET, path, photo);

    const { data, error } = await client
      .from('users')
      .update({
        avatar_url: storagePublicUrl(AVATARS_BUCKET, path),
        avatar_path: path
      })
      .eq('id', authUser.idUser)
      .select('id')
      .maybeSingle<{ id: string }>();

    // RLS answers a refused write with no row, so the just-uploaded object
    // would sit in the bucket unreferenced.
    if (error || !data) {
      await removePhoto(client, AVATARS_BUCKET, path);

      throw writeFailed(
        'Could not save your photo',
        'ME_PHOTO_FAILED',
        error ?? undefined
      );
    }

    // The bucket is public, so a picture left behind stays downloadable by
    // anyone who ever saw its URL.
    if (previous) await removePhoto(client, AVATARS_BUCKET, previous);

    return this.findMe(authUser);
  }

  async removePhoto(authUser: AuthUser): Promise<void> {
    const client = userClient(authUser);
    const previous = await currentAvatarPath(client, authUser);

    const { error } = await client
      .from('users')
      .update({ avatar_url: null, avatar_path: null })
      .eq('id', authUser.idUser);

    if (error) {
      throw writeFailed(
        'Could not remove your photo',
        'ME_PHOTO_REMOVE_FAILED',
        error
      );
    }

    if (previous) await removePhoto(client, AVATARS_BUCKET, previous);
  }
}

/**
 * Only a path we stored ourselves may be deleted: `avatar_url` also holds the
 * identity provider's URL, which has no object of ours behind it.
 */
const currentAvatarPath = async (
  client: ReturnType<typeof userClient>,
  authUser: AuthUser
): Promise<string | null> => {
  const { data } = await client
    .from('users')
    .select('avatar_path')
    .eq('id', authUser.idUser)
    .maybeSingle<{ avatar_path: string | null }>();

  return data?.avatar_path ?? null;
};

const routeScale = (value: unknown): RouteGradeScale => {
  if (!isRouteGradeScale(value)) {
    throw new ValidationException(
      `Unknown route grade scale "${String(value)}"`,
      'ME_GRADE_SCALE_UNKNOWN'
    );
  }

  return value;
};

const boulderScale = (value: unknown): BoulderGradeScale => {
  if (!isBoulderGradeScale(value)) {
    throw new ValidationException(
      `Unknown boulder grade scale "${String(value)}"`,
      'ME_GRADE_SCALE_UNKNOWN'
    );
  }

  return value;
};
