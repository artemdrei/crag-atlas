import { useMemo } from 'react';

import type { ClimbType, GradeHistogramGroup } from '@crag-atlas/api';
import { Plural, useLingui } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { foldGradeBars, toGradeBars, useDisplayGrade } from '@web/shared/lib';
import type { GradeTone } from '@web/shared/theme/palette';

const COLUMN_WIDTH = 56;
// A compact column keeps its width instead of sharing the row, so a sector of
// three grades and one of eight draw bars a reader can compare.
const COMPACT_COLUMN_WIDTH = 26;

// A compact row scales against at least this many routes, so a sector whose
// tallest grade holds one route draws a low row instead of a full-height one.
const COMPACT_REFERENCE = 8;
const COMPACT_HEIGHT = 40;

const COLUMN_MIN_WIDTH = 22;
const CROWDED_COLUMNS = 12;

export interface Props {
  group: GradeHistogramGroup;
  selectedGrades?: string[];
  onToggleGrade?: (key: string) => void;
  isCompact?: boolean;
  maxColumns?: number;
  className?: string;
}

export const GradeHistogram = ({
  group,
  selectedGrades,
  onToggleGrade,
  isCompact,
  maxColumns,
  className
}: Props) => {
  const { t } = useLingui();
  const displayGrade = useDisplayGrade();
  const compact = !!isCompact;

  // A folded column stands for two grades, and the filter below picks one, so
  // a histogram that filters is never folded.
  const bars = useMemo(() => {
    const all = toGradeBars(group.grades, displayGrade);

    return maxColumns && !onToggleGrade ? foldGradeBars(all, maxColumns) : all;
  }, [group.grades, displayGrade, maxColumns, onToggleGrade]);

  if (bars.length === 0) return null;

  const climbTypeLabel: Record<ClimbType, string> = {
    sport: t`Sport`,
    trad: t`Trad`,
    boulder: t`Bouldering`
  };
  const top = Math.max(...bars.map(({ count }) => count));
  const labelStep = bars.length > CROWDED_COLUMNS ? 2 : 1;
  const hasFilter = !!selectedGrades && selectedGrades.length > 0;
  const isPicked = (key: string) =>
    !hasFilter || !!selectedGrades?.includes(key);

  return (
    <ChartStyled className={className} isCompact={compact}>
      {!compact && (
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
      <ScrollStyled isCompact={compact}>
        <BarsRowStyled isCompact={compact} columns={bars.length}>
          {bars.map(({ key, label, tone, count }) => {
            const cell = (
              <>
                <CountStyled variant="caption" noWrap isMuted={!isPicked(key)}>
                  {count}
                </CountStyled>
                <BarStyled
                  tone={tone}
                  share={
                    compact
                      ? count / Math.max(top, COMPACT_REFERENCE)
                      : top
                        ? count / top
                        : 0
                  }
                  isCompact={compact}
                  isMuted={!isPicked(key)}
                />
              </>
            );

            // A card is one big button, and buttons cannot nest.
            return onToggleGrade ? (
              <BarColumnStyled
                key={key}
                type="button"
                isCompact={compact}
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
              <ColumnStyled key={key} isCompact={compact}>
                {cell}
              </ColumnStyled>
            );
          })}
        </BarsRowStyled>
        <LabelsRowStyled isCompact={compact} columns={bars.length}>
          {bars.map(({ key, label }, index) => (
            <ColumnStyled key={key} isCompact={compact}>
              <Typography variant="caption" color="text.secondary" noWrap>
                {index % labelStep === 0 ? label : ''}
              </Typography>
            </ColumnStyled>
          ))}
        </LabelsRowStyled>
      </ScrollStyled>
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
  width: ${({ isCompact }) => (isCompact ? 'max-content' : 'auto')};
  max-width: ${({ columns, isCompact }) =>
    isCompact ? 'none' : `${columns * COLUMN_WIDTH}px`};
  padding-bottom: ${({ theme, isCompact }) =>
    theme.spacing(isCompact ? 0 : 0.5)};
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

const LabelsRowStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isCompact' && prop !== 'columns'
})<{ isCompact: boolean; columns: number }>`
  display: flex;
  gap: ${({ theme, isCompact }) => theme.spacing(isCompact ? 0.5 : 1)};
  width: ${({ isCompact }) => (isCompact ? 'max-content' : 'auto')};
  max-width: ${({ columns, isCompact }) =>
    isCompact ? 'none' : `${columns * COLUMN_WIDTH}px`};
`;

const ScrollStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isCompact'
})<{ isCompact: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme, isCompact }) => theme.spacing(isCompact ? 0 : 0.5)};
  min-width: 0;
  overflow-x: auto;
`;

const ColumnStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isCompact'
})<{ isCompact?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  flex: ${({ isCompact }) => (isCompact ? '0 0 auto' : '1 1 0')};
  width: ${({ isCompact }) => (isCompact ? `${COMPACT_COLUMN_WIDTH}px` : 'auto')};
  min-width: ${({ isCompact }) =>
    isCompact ? COMPACT_COLUMN_WIDTH : COLUMN_MIN_WIDTH}px;
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
})<{
  tone: GradeTone;
  share: number;
  isCompact: boolean;
  isMuted: boolean;
}>`
  width: 100%;
  height: ${({ share, isCompact }) =>
    isCompact
      ? `${Math.max(share * COMPACT_HEIGHT, 4)}px`
      : `${Math.max(share * 72, 6)}px`};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px
    ${({ theme }) => theme.shape.borderRadius}px 0 0;
  background: ${({ theme, tone }) => theme.palette.grade[tone].background};
  opacity: ${({ isMuted }) => (isMuted ? 0.25 : 1)};
`;
