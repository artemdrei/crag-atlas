import { useLingui } from '@lingui/react/macro';
import ButtonBase from '@mui/material/ButtonBase';
import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useScrollHint } from '@web/shared/lib';
import { getScoreColor } from '@web/shared/theme/palette';
import { hoverRing } from '@web/shared/theme/surfaces';

import type { ConditionsDay } from '../entities';
import {
  dayNumber,
  dayTemperature,
  dominantWeatherKind,
  weekdayLabel
} from '../lib';
import { WeatherIcon } from './WeatherIcons';

export interface Props {
  date: string;
  days: ConditionsDay[];
  onSelect: (date: string) => void;
}

const WEATHER_ICON_PX = 36;
const SKELETON_KEYS = Array.from(
  { length: 7 },
  (_, index) => `skeleton-${index}`
);

// Built from the same chip, so the loading row has the loaded row's shape.
export const ConditionsDayStripSkeleton = () => (
  <StripStyled>
    {SKELETON_KEYS.map((key) => (
      <ChipStyled key={key} disabled isSelected={false}>
        <Typography variant="caption">
          <Skeleton width={56} />
        </Typography>
        <WeatherStyled>
          <Skeleton
            variant="circular"
            width={WEATHER_ICON_PX}
            height={WEATHER_ICON_PX}
          />
        </WeatherStyled>
        <Typography variant="subtitle1">
          <Skeleton width={28} />
        </Typography>
      </ChipStyled>
    ))}
  </StripStyled>
);

export const ConditionsDayStrip = ({ date, days, onSelect }: Props) => {
  const { t, i18n } = useLingui();
  const scroll = useScrollHint();

  return (
    <ViewportStyled>
      <StripStyled ref={scroll.ref} onScroll={scroll.onScroll}>
        {days.map((day, index) => {
          const temperature = dayTemperature(day);

          return (
            <ChipStyled
              key={day.date}
              isSelected={day.date === date}
              onClick={() => onSelect(day.date)}
            >
              <DayStyled variant="caption">
                {index === 0 ? t`today` : weekdayLabel(day.date, i18n.locale)}{' '}
                <DateStyled>{dayNumber(day.date)}</DateStyled>
              </DayStyled>
              <WeatherStyled>
                <WeatherIcon
                  isAnimated
                  size={WEATHER_ICON_PX}
                  kind={dominantWeatherKind(day.hours)}
                />
                {temperature && (
                  <TemperatureStyled variant="caption">
                    {temperature.minC}° / {temperature.maxC}°
                  </TemperatureStyled>
                )}
              </WeatherStyled>
              <ScoreStyled variant="subtitle1" band={day.band}>
                {day.score ?? '—'}
              </ScoreStyled>
            </ChipStyled>
          );
        })}
      </StripStyled>
      {scroll.hasBefore && <FadeStyled side="left" />}
      {scroll.hasMore && <FadeStyled side="right" />}
    </ViewportStyled>
  );
};

const ViewportStyled = styled('div')`
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
`;

const FadeStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'side'
})<{ side: 'left' | 'right' }>`
  position: absolute;
  top: 0;
  bottom: 0;
  ${({ side }) => side}: 0;
  width: ${({ theme }) => theme.spacing(6)};
  pointer-events: none;
  background: linear-gradient(
    to ${({ side }) => side},
    transparent,
    ${({ theme }) => theme.palette.background.paper}
  );
`;

const StripStyled = styled('div')`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  overflow-x: auto;
  padding-bottom: ${({ theme }) => theme.spacing(0.5)};
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ChipStyled = styled(ButtonBase, {
  shouldForwardProp: (prop) => prop !== 'isSelected'
})<{ isSelected: boolean }>`
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.25)};
  width: 76px;
  padding: ${({ theme }) => theme.spacing(1, 0.5)};
  border: 2px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.palette.primary.main : theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  background-color: ${({ theme }) => theme.palette.background.paper};

  &:hover {
    ${({ theme }) => hoverRing(theme.palette.primary.main)}
    background-color: ${({ theme }) => theme.palette.action.hover};
  }
`;

const WeatherStyled = styled('span')`
  position: relative;
  display: flex;
  margin: ${({ theme }) => theme.spacing(-0.5, 0, 1.25)};
  opacity: 0.6;
`;

const TemperatureStyled = styled(Typography)`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 60%);
  padding: 0 2px;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  background-color: ${({ theme }) => theme.palette.background.paper};
  line-height: 1.2;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
`;

const DayStyled = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const DateStyled = styled('span')`
  color: ${({ theme }) => theme.palette.text.disabled};
`;

// The number carries the colour, so a glance down the strip finds the good
// day before a single score is read.
const ScoreStyled = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'band'
})<{ band: ConditionsDay['band'] }>`
  color: ${({ theme, band }) =>
    getScoreColor(theme.palette.conditionBand, band) ??
    theme.palette.text.disabled};
  font-variant-numeric: tabular-nums;
`;
