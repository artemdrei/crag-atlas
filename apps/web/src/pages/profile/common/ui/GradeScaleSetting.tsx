import type { ReactNode } from 'react';

import type { BoulderGradeScale, RouteGradeScale } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import {
  BOULDER_GRADE_SCALES,
  gradeScaleExample,
  gradeScaleName,
  ROUTE_GRADE_SCALES
} from '@web/shared/lib';

import { useGradeScaleSetting } from '../hooks';

export const GradeScaleSetting = () => {
  const { t } = useLingui();
  const { gradeScaleRoute, gradeScaleBoulder, isLoading, isPending, save } =
    useGradeScaleSetting();

  return (
    <CardStyled elevation={0}>
      <Typography variant="body1">
        <Trans>Grade system</Trans>
      </Typography>

      <GradeScaleField
        label={<Trans>Routes</Trans>}
        ariaLabel={t`Grade system — routes`}
        scales={ROUTE_GRADE_SCALES}
        value={gradeScaleRoute}
        isLoading={isLoading}
        isPending={isPending}
        onChange={(scale) => save({ gradeScaleRoute: scale })}
      />

      <GradeScaleField
        label={<Trans>Bouldering</Trans>}
        ariaLabel={t`Grade system — boulder`}
        scales={BOULDER_GRADE_SCALES}
        value={gradeScaleBoulder}
        isLoading={isLoading}
        isPending={isPending}
        onChange={(scale) => save({ gradeScaleBoulder: scale })}
      />
    </CardStyled>
  );
};

interface GradeScaleFieldProps<
  Scale extends RouteGradeScale | BoulderGradeScale
> {
  label: ReactNode;
  ariaLabel: string;
  scales: readonly Scale[];
  value: Scale;
  isLoading: boolean;
  isPending: boolean;
  onChange: (scale: Scale) => void;
}

const GradeScaleField = <Scale extends RouteGradeScale | BoulderGradeScale>({
  label,
  ariaLabel,
  scales,
  value,
  isLoading,
  isPending,
  onChange
}: GradeScaleFieldProps<Scale>) => (
  <FieldStyled>
    <LabelStyled variant="body2">{label}</LabelStyled>
    {isLoading ? (
      <ControlSkeletonStyled variant="rounded" />
    ) : (
      <Select
        size="small"
        fullWidth
        disabled={isPending}
        inputProps={{ 'aria-label': ariaLabel }}
        value={value}
        onChange={(event) => onChange(event.target.value as Scale)}
      >
        {scales.map((scale) => (
          <MenuItem key={scale} value={scale}>
            {`${gradeScaleName(scale)} (${gradeScaleExample(scale)})`}
          </MenuItem>
        ))}
      </Select>
    )}
  </FieldStyled>
);

const CardStyled = styled(Paper)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  width: 100%;
  padding: ${({ theme }) => theme.spacing(1.5, 2)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const FieldStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.75)};
`;

const LabelStyled = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const ControlSkeletonStyled = styled(Skeleton)`
  width: 100%;
  height: 40px;
`;
