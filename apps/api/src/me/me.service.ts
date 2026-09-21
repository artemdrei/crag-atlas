import { Injectable } from '@nestjs/common';

import { ValidationException } from '../common/exceptions/app.exception';
import type { AuthUser } from '../common/guards/supabaseAuth.guard';
import type { BoulderGradeScale, RouteGradeScale } from '../common/utils/grade';
import {
  DEFAULT_BOULDER_GRADE_SCALE,
  DEFAULT_ROUTE_GRADE_SCALE,
  isBoulderGradeScale,
  isRouteGradeScale
} from '../common/utils/grade';
import { userClient } from '../common/utils/userClient';
import type { MeDto, UpdateMeDto } from './me.types';

interface PreferencesRow {
  grade_scale_route: RouteGradeScale;
  grade_scale_boulder: BoulderGradeScale;
}

@Injectable()
export class MeService {
  async findMe(authUser: AuthUser): Promise<MeDto> {
    // Asking as the user: the select policy only ever returns their own row,
    // so a missing row and "not an admin" are the same answer.
    const { data } = await userClient(authUser)
      .from('user_roles')
      .select('role')
      .eq('role', 'admin')
      .maybeSingle();

    const { data: preferences } = await userClient(authUser)
      .from('users')
      .select('grade_scale_route, grade_scale_boulder')
      .eq('id', authUser.idUser)
      .maybeSingle<PreferencesRow>();

    return {
      idUser: authUser.idUser,
      isAdmin: !!data,
      gradeScaleRoute:
        preferences?.grade_scale_route ?? DEFAULT_ROUTE_GRADE_SCALE,
      gradeScaleBoulder:
        preferences?.grade_scale_boulder ?? DEFAULT_BOULDER_GRADE_SCALE
    };
  }

  async update(authUser: AuthUser, payload: UpdateMeDto): Promise<MeDto> {
    // A PATCH that omits a field leaves it alone.
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
      throw new ValidationException(error.message, 'ME_UPDATE_FAILED');
    }

    return this.findMe(authUser);
  }
}

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
