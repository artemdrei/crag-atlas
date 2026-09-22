import type { ClimbType, GradeHistogramGroup } from '@crag-atlas/api';
import { Plural, useLingui } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useDisplayGrade } from '@web/shared/lib';
import type { GradeTone } from '@web/shared/theme/palette';

import { toGradeBars } from '../lib';

const COLUMN_WIDTH = 56;

export interface Props {
  group: GradeHistogramGroup;
  selectedGrades?: string[];
  onToggleGrade?: (key: string) => void;
  isCompact?: boolean;
  className?: string;
}

export const GradeHistogram = ({
  group,
  selectedGrades,
  onToggleGrade,
  isCompact,
  className
}: Props) => {
  const { t } = useLingui();
  const displayGrade = useDisplayGrade();

  const bars = toGradeBars(group.grades, displayGrade);

  if (bars.length === 0) return null;

  const climbTypeLabel: Record<ClimbType, string> = {
    sport: t`Sport`,
    trad: t`Trad`,
    boulder: t`Bouldering`
  };
  const top = Math.max(...bars.map(({ count }) => count));
  const hasFilter = !!selectedGrades && selectedGrades.length > 0;
  const isPicked = (key: string) =>
    !hasFilter || !!selectedGrades?.includes(key);

  return (
    <ChartStyled className={className} isCompact={!!isCompact}>
      {!isCompact && (
        <HeaderRowStyled>
          <TitleStyled variant="overline" color="text.secondary">
            {climbTypeLabel[group.type]}
          </TitleStyled>
          <Typography variant="caption" color="text.secondary">
            <Plural
              value={group.routeCount}
              one="# route"
              few="# routes"
              many="# routes"
              other="# routes"
            />
          </Typography>
        </HeaderRowStyled>
      )}
      <BarsRowStyled isCompact={!!isCompact} columns={bars.length}>
        {bars.map(({ key, label, tone, count }) => {
          const cell = (
            <>
              <CountStyled variant="caption" noWrap isMuted={!isPicked(key)}>
                {count}
              </CountStyled>
              <BarStyled
                tone={tone}
                share={top ? count / top : 0}
                isCompact={!!isCompact}
                isMuted={!isPicked(key)}
              />
            </>
          );

          // A card is itself one big button, so a static histogram must not
          // put more buttons inside it.
          return onToggleGrade ? (
            <BarColumnStyled
              key={key}
              type="button"
              aria-pressed={isPicked(key) && hasFilter}
              aria-label={label}
              onClick={(event) => {
                event.stopPropagation();
                onToggleGrade(key);
              }}
            >
              {cell}
            </BarColumnStyled>
          ) : (
            <ColumnStyled key={key}>{cell}</ColumnStyled>
          );
        })}
      </BarsRowStyled>
      <LabelsRowStyled isCompact={!!isCompact} columns={bars.length}>
        {bars.map(({ label }) => (
          <ColumnStyled key={label}>
            <Typography variant="caption" color="text.secondary" noWrap>
              {label}
            </Typography>
          </ColumnStyled>
        ))}
      </LabelsRowStyled>
    </ChartStyled>
  );
};

const ChartStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isCompact'
})<{ isCompact: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme, isCompact }) => theme.spacing(isCompact ? 0.5 : 1.5)};
  min-width: 0;
`;

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const TitleStyled = styled(Typography)`
  letter-spacing: 0.08em;
`;

const BarsRowStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isCompact' && prop !== 'columns'
})<{ isCompact: boolean; columns: number }>`
  display: flex;
  align-items: flex-end;
  gap: ${({ theme, isCompact }) => theme.spacing(isCompact ? 0.5 : 1)};
  max-width: ${({ columns }) => columns * COLUMN_WIDTH}px;
  padding-bottom: ${({ theme }) => theme.spacing(0.5)};
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

const LabelsRowStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isCompact' && prop !== 'columns'
})<{ isCompact: boolean; columns: number }>`
  display: flex;
  gap: ${({ theme, isCompact }) => theme.spacing(isCompact ? 0.5 : 1)};
  max-width: ${({ columns }) => columns * COLUMN_WIDTH}px;
`;

const ColumnStyled = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  flex: 1 1 0;
  min-width: 0;
`;

const BarColumnStyled = styled(ColumnStyled.withComponent('button'))`
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
`;

const CountStyled = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'isMuted'
})<{ isMuted: boolean }>`
  font-weight: 700;
  line-height: 1;
  color: ${({ theme, isMuted }) =>
    isMuted ? theme.palette.text.secondary : theme.palette.text.primary};
`;

const BarStyled = styled('div', {
  shouldForwardProp: (prop) =>
    prop !== 'tone' &&
    prop !== 'share' &&
    prop !== 'isCompact' &&
    prop !== 'isMuted'
})<{ tone: GradeTone; share: number; isCompact: boolean; isMuted: boolean }>`
  width: 100%;
  height: ${({ share, isCompact }) =>
    isCompact
      ? `${Math.max(share * 20, 4)}px`
      : `${Math.max(share * 72, 6)}px`};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px
    ${({ theme }) => theme.shape.borderRadius}px 0 0;
  background: ${({ theme, tone }) => theme.palette.grade[tone].background};
  opacity: ${({ isMuted }) => (isMuted ? 0.25 : 1)};
`;
