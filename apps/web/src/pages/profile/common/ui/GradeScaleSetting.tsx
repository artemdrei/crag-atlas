import type { BoulderGradeScale, RouteGradeScale } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import {
  BOULDER_GRADE_SCALES,
  gradeScaleExample,
  gradeScaleName,
  ROUTE_GRADE_SCALES
} from '@web/shared/lib';

import { useGradeScaleSetting } from '../hooks';
import { ProfileSettingRow } from './ProfileSettingRow';

export const GradeScaleSetting = () => {
  const { t } = useLingui();
  const { gradeScaleRoute, gradeScaleBoulder, isPending, save } =
    useGradeScaleSetting();

  return (
    <>
      <ProfileSettingRow label={<Trans>Grade system — routes</Trans>}>
        <Select
          size="small"
          disabled={isPending}
          // The row's label sits beside the control, not on it.
          inputProps={{ 'aria-label': t`Grade system — routes` }}
          value={gradeScaleRoute}
          onChange={(event) =>
            save({ gradeScaleRoute: event.target.value as RouteGradeScale })
          }
        >
          {ROUTE_GRADE_SCALES.map((scale) => (
            <MenuItem key={scale} value={scale}>
              {`${gradeScaleName(scale)} (${gradeScaleExample(scale)})`}
            </MenuItem>
          ))}
        </Select>
      </ProfileSettingRow>
      <ProfileSettingRow label={<Trans>Grade system — boulder</Trans>}>
        <Select
          size="small"
          disabled={isPending}
          inputProps={{ 'aria-label': t`Grade system — boulder` }}
          value={gradeScaleBoulder}
          onChange={(event) =>
            save({ gradeScaleBoulder: event.target.value as BoulderGradeScale })
          }
        >
          {BOULDER_GRADE_SCALES.map((scale) => (
            <MenuItem key={scale} value={scale}>
              {`${gradeScaleName(scale)} (${gradeScaleExample(scale)})`}
            </MenuItem>
          ))}
        </Select>
      </ProfileSettingRow>
    </>
  );
};
