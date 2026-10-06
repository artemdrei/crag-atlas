import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import type { AscentTypeTone } from '@web/shared/theme/palette';
import { resolveAscentTypeInk } from '@web/shared/theme/palette';
import { ASCENT_TYPES } from '@web/shared/types';
import { GradeBadge } from '@web/shared/ui';

import type { GradeBar } from '../entities';

export interface Props {
  bars: GradeBar[];
  isCompact?: boolean;
  className?: string;
}

export const GradeChart = ({ bars, isCompact, className }: Props) => {
  if (bars.length === 0) {
    return null;
  }

  const top = Math.max(...bars.map(({ total }) => total));

  return (
    <ChartStyled className={className}>
      {!isCompact && (
        <TitleStyled variant="overline" color="text.secondary">
          <Trans>All ascents by grade</Trans>
        </TitleStyled>
      )}
      {bars.map(({ grade, sourceGrade, scale, total, counts }) => (
        <RowStyled key={grade}>
          <BadgeStyled>
            <GradeBadge grade={sourceGrade} scale={scale} />
          </BadgeStyled>
          <CountStyled noWrap variant="body1" color="text.secondary">
            / {total}
          </CountStyled>
          <TrackStyled>
            <BarStyled share={total / top}>
              {ASCENT_TYPES.filter((ascentType) => counts[ascentType]).map(
                (ascentType) => (
                  <SegmentStyled
                    key={ascentType}
                    data-ascent-type={ascentType}
                    ascentType={ascentType}
                    count={counts[ascentType] ?? 0}
                  />
                )
              )}
            </BarStyled>
          </TrackStyled>
        </RowStyled>
      ))}
    </ChartStyled>
  );
};

const ChartStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
`;

const TitleStyled = styled(Typography)`
  text-transform: none;
  letter-spacing: 0.08em;
`;

// A grid, not flex bases: iOS Safari sized a flex label by its text and let
// the bar run over the count.
const RowStyled = styled('div')`
  display: grid;
  grid-template-columns:
    ${({ theme }) => theme.spacing(8)} ${({ theme }) => theme.spacing(5)}
    minmax(0, 1fr);
  align-items: center;
  column-gap: ${({ theme }) => theme.spacing(0.75)};
`;

const BadgeStyled = styled('div')`
  display: flex;
`;

const TrackStyled = styled('div')`
  margin-left: ${({ theme }) => theme.spacing(1.25)};
`;

const BarStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'share'
})<{ share: number }>`
  display: flex;
  gap: 2px;
  width: ${({ share }) => Math.max(share * 100, 2)}%;
  height: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  overflow: hidden;
`;

const SegmentStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'ascentType' && prop !== 'count'
})<{ ascentType: AscentTypeTone; count: number }>`
  flex: ${({ count }) => count} 1 0;
  background: ${({ theme, ascentType }) =>
    resolveAscentTypeInk(theme.palette.mode, ascentType)};
`;

const CountStyled = styled(Typography)`
  font-weight: 600;
`;
