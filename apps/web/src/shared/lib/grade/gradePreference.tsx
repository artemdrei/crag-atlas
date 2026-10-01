import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo } from 'react';

import type {
  BoulderGradeScale,
  GradeScale,
  RouteGradeScale
} from '@crag-atlas/api';
import { getScale } from '@openbeta/sandbag';

import { displayGrade } from './displayGrade';

export interface GradePreference {
  route: RouteGradeScale;
  boulder: BoulderGradeScale;
}

// What a reader sees before /me answers.
const DEFAULT_PREFERENCE: GradePreference = {
  route: 'french',
  boulder: 'vscale'
};

const GradePreferenceContext =
  createContext<GradePreference>(DEFAULT_PREFERENCE);

export const GradePreferenceProvider = ({
  preference,
  children
}: {
  preference: GradePreference;
  children: ReactNode;
}) => {
  const value = useMemo(
    () => ({ route: preference.route, boulder: preference.boulder }),
    [preference.route, preference.boulder]
  );

  return (
    <GradePreferenceContext.Provider value={value}>
      {children}
    </GradePreferenceContext.Provider>
  );
};

// Which of the two preferences applies follows from the scale's own family,
// not from the route's type.
export const useDisplayGrade = () => {
  const preference = useContext(GradePreferenceContext);

  return useCallback(
    (grade: string, scale: GradeScale) =>
      displayGrade(
        grade,
        scale,
        getScale(scale)?.conversionGroup === 'bouldering'
          ? preference.boulder
          : preference.route
      ),
    [preference]
  );
};

export interface GradeRange {
  gradeMin?: string | null;
  gradeMinScale?: GradeScale | null;
  gradeMax?: string | null;
  gradeMaxScale?: GradeScale | null;
}

// The two ends come from two different routes, so each converts on its own.
export const useGradeRange = (range: GradeRange): string | null => {
  const displayGrade = useDisplayGrade();

  const { gradeMin, gradeMinScale, gradeMax, gradeMaxScale } = range;

  return useMemo(() => {
    if (!gradeMin || !gradeMinScale || !gradeMax || !gradeMaxScale) {
      return null;
    }

    const min = displayGrade(gradeMin, gradeMinScale);
    const max = displayGrade(gradeMax, gradeMaxScale);

    return min === max ? min : `${min}-${max}`;
  }, [displayGrade, gradeMin, gradeMinScale, gradeMax, gradeMaxScale]);
};
