import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import type { AscentTypeTone } from '@web/shared/theme/palette';
import { resolveAscentTypeInk } from '@web/shared/theme/palette';
import { ASCENT_TYPES } from '@web/shared/ui';

import type { GradeBar } from '../entities';

export interface Props {
  bars: GradeBar[];
  isCompact?: boolean;
}

export const GradeChart = ({ bars, isCompact }: Props) => {
  if (bars.length === 0) {
    return null;
  }

  const top = Math.max(...bars.map(({ total }) => total));

  return (
    <ChartStyled>
      {!isCompact && (
        <TitleStyled variant="overline" color="text.secondary">
          <Trans>All ascents by grade</Trans>
        </TitleStyled>
      )}
      {bars.map(({ grade, total, counts }) => (
        <RowStyled key={grade}>
          <LabelStyled>
            <GradeStyled variant="body2" noWrap>
              {grade}
            </GradeStyled>
            <CountStyled variant="body2" color="text.secondary">
              / {total}
            </CountStyled>
          </LabelStyled>
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

const RowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const LabelStyled = styled('div')`
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(0.5)};
  flex: 0 0 ${({ theme }) => theme.spacing(9)};
`;

const GradeStyled = styled(Typography)`
  font-weight: 700;
`;

const TrackStyled = styled('div')`
  flex: 1 1 auto;
  min-width: 0;
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
