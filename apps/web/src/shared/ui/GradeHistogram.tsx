import { useMemo } from 'react';

import type { ClimbType, GradeHistogramGroup } from '@crag-atlas/api';
import { Plural, useLingui } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import {
  foldGradeBars,
  toGradeBars,
  useDisplayGrade,
  useScrollHint
} from '@web/shared/lib';
import type { GradeTone } from '@web/shared/theme/palette';
import { resolveGradeBar, resolveGradeHue } from '@web/shared/theme/palette';

const COLUMN_WIDTH = 56;
// A fixed width, so a sector of three grades and one of eight compare.
const COMPACT_COLUMN_WIDTH = 26;

// A card scales against at least this many routes, so a sector whose tallest
// grade holds one route draws a low row. The picker always fills its height.
const COMPACT_REFERENCE = 8;
const COMPACT_HEIGHT = 40;
// The picker is the main filter, so it is drawn taller and wider than the
// glance a card carries.
const PICKER_HEIGHT = 72;
const PICKER_COLUMN_WIDTH = 32;

const COLUMN_MIN_WIDTH = 22;
const CROWDED_COLUMNS = 12;

export interface Props {
  group: GradeHistogramGroup;
  selectedGrades?: string[];
  onToggleGrade?: (key: string) => void;
  isCompact?: boolean;
  hasScrollHint?: boolean;
  maxColumns?: number;
  className?: string;
}

export const GradeHistogram = ({
  group,
  selectedGrades,
  onToggleGrade,
  isCompact,
  hasScrollHint,
  maxColumns,
  className
}: Props) => {
  const { t } = useLingui();
  const displayGrade = useDisplayGrade();
  const scroll = useScrollHint();
  const compact = !!isCompact;
  const isPicker = !!onToggleGrade;

  // A folded column stands for two grades, and the filter picks one.
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
  const labelStep = !isPicker && bars.length > CROWDED_COLUMNS ? 2 : 1;
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
      <ViewportStyled>
        <ScrollStyled
          ref={scroll.ref}
          isCompact={compact}
          hasFadeStart={!!hasScrollHint && scroll.hasBefore}
          hasFadeEnd={!!hasScrollHint && scroll.hasMore}
          onScroll={scroll.onScroll}
        >
          <BarsRowStyled isCompact={compact} columns={bars.length}>
            {bars.map(({ key, label, tone, count }) => {
              const cell = (
                <>
                  <CountStyled
                    variant="caption"
                    noWrap
                    isMuted={!isPicked(key)}
                  >
                    {count}
                  </CountStyled>
                  <BarStyled
                    tone={tone}
                    share={
                      compact && !isPicker
                        ? count / Math.max(top, COMPACT_REFERENCE)
                        : top
                          ? count / top
                          : 0
                    }
                    isCompact={compact}
                    isPicker={isPicker}
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
                  isPicker
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
                <ColumnStyled key={key} isCompact={compact} isPicker={false}>
                  {cell}
                </ColumnStyled>
              );
            })}
          </BarsRowStyled>
          <LabelsRowStyled isCompact={compact} columns={bars.length}>
            {bars.map(({ key, label }, index) => (
              <ColumnStyled key={key} isCompact={compact} isPicker={isPicker}>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {index % labelStep === 0 ? label : ''}
                </Typography>
              </ColumnStyled>
            ))}
          </LabelsRowStyled>
        </ScrollStyled>
      </ViewportStyled>
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

const ViewportStyled = styled('div')`
  position: relative;
  min-width: 0;
`;

const FADE_PX = 24;

// A mask fades the bars themselves, so the edge is clean on whatever surface
// the chart sits on — a painted overlay only matches one background.
const fadeMaskOf = (hasFadeStart: boolean, hasFadeEnd: boolean) =>
  `linear-gradient(to right, ${hasFadeStart ? 'transparent' : 'black'} 0, black ${FADE_PX}px, black calc(100% - ${FADE_PX}px), ${hasFadeEnd ? 'transparent' : 'black'} 100%)`;

const ScrollStyled = styled('div', {
  shouldForwardProp: (prop) =>
    prop !== 'isCompact' && prop !== 'hasFadeStart' && prop !== 'hasFadeEnd'
})<{ isCompact: boolean; hasFadeStart: boolean; hasFadeEnd: boolean }>`
  mask-image: ${({ hasFadeStart, hasFadeEnd }) =>
    fadeMaskOf(hasFadeStart, hasFadeEnd)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme, isCompact }) => theme.spacing(isCompact ? 0 : 0.5)};
  min-width: 0;
  overflow-x: auto;
`;

const compactWidthOf = (isPicker: boolean) =>
  isPicker ? PICKER_COLUMN_WIDTH : COMPACT_COLUMN_WIDTH;

const ColumnStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isCompact' && prop !== 'isPicker'
})<{ isCompact?: boolean; isPicker: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  flex: ${({ isCompact }) => (isCompact ? '0 0 auto' : '1 1 0')};
  width: ${({ isCompact, isPicker }) =>
    isCompact ? `${compactWidthOf(isPicker)}px` : 'auto'};
  min-width: ${({ isCompact, isPicker }) =>
    isCompact ? compactWidthOf(isPicker) : COLUMN_MIN_WIDTH}px;
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
    prop !== 'isPicker' &&
    prop !== 'isMuted'
})<{
  tone: GradeTone;
  share: number;
  isCompact: boolean;
  isPicker: boolean;
  isMuted: boolean;
}>`
  width: 100%;
  height: ${({ share, isCompact, isPicker }) =>
    isCompact
      ? `${Math.max(share * (isPicker ? PICKER_HEIGHT : COMPACT_HEIGHT), 4)}px`
      : `${Math.max(share * 72, 6)}px`};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px
    ${({ theme }) => theme.shape.borderRadius}px 0 0;
  background: ${({ theme, tone }) => resolveGradeBar(theme.palette.mode, tone)};
  border: none;
  border-bottom: 1px solid
    ${({ theme, tone }) => resolveGradeHue(theme.palette.mode, tone)};
  opacity: ${({ isMuted }) => (isMuted ? 0.25 : 1)};
`;
