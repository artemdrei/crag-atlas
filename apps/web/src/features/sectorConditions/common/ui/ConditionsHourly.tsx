import { useState } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import AirIcon from '@mui/icons-material/Air';
import BarChartIcon from '@mui/icons-material/BarChart';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import Fade from '@mui/material/Fade';
import { styled } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

import type { ConditionsHour } from '../entities';
import type { Metric } from '../lib';
import { hourValueOf, verdictOf, weatherKindOf } from '../lib';
import { PrecipitationIcon, WeatherIcon, WindIcon } from './WeatherIcons';

export interface Props {
  hours: ConditionsHour[];
}

const FADE_MS = 160;
const HOUR_ICON_PX = 36;

export const ConditionsHourly = ({ hours }: Props) => {
  const { t } = useLingui();
  const [metric, setMetric] = useState<Metric>('weather');
  // What is on screen lags the choice by one fade: the old series goes out
  // before the new one is rendered, so the two never cross-dissolve into an
  // unreadable overlap.
  const [shown, setShown] = useState<Metric>('weather');
  const isSettled = metric === shown;

  const subtitle: Record<Metric, string> = {
    score: t`Conditions score`,
    weather: t`Temperature`,
    precipitation: t`Precipitation`,
    wind: t`Wind`
  };

  // Named once, in the column that never scrolls away, rather than repeated
  // under every hour.
  const unit: Record<Metric, string> = {
    score: t`points`,
    weather: t`°C`,
    precipitation: t`mm`,
    wind: t`km/h`
  };

  return (
    <SectionStyled>
      <HeaderStyled>
        <div>
          <Typography variant="subtitle1">
            <Trans>Hourly</Trans>
          </Typography>
          <Fade in={isSettled} timeout={FADE_MS}>
            <Typography variant="caption" color="text.secondary">
              {subtitle[shown]}
            </Typography>
          </Fade>
        </div>

        <ToggleButtonGroup
          exclusive
          size="small"
          value={metric}
          onChange={(_event, next: Metric | null) => next && setMetric(next)}
        >
          <ToggleButton value="score" aria-label={t`Conditions score`}>
            <BarChartIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="weather" aria-label={t`Weather`}>
            <FilterDramaIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="precipitation" aria-label={t`Precipitation`}>
            <WaterDropIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="wind" aria-label={t`Wind`}>
            <AirIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </HeaderStyled>

      <Fade in={isSettled} timeout={FADE_MS} onExited={() => setShown(metric)}>
        <BodyStyled>
          {/* Outside the scroller, so the reader never loses which row is the
            clock and which is the reading. */}
          <LegendStyled>
            <LegendLabelStyled variant="caption">
              <Trans>time</Trans>
            </LegendLabelStyled>
            <IconSlotStyled />
            <LegendLabelStyled variant="caption">
              {unit[shown]}
            </LegendLabelStyled>
          </LegendStyled>

          <GridStyled>
            {hours.map((hour) => (
              <ColumnStyled key={hour.at}>
                <Typography variant="caption" color="text.secondary">
                  {hour.at.slice(0, 2)}
                </Typography>
                <HourCell hour={hour} metric={shown} />
              </ColumnStyled>
            ))}
          </GridStyled>
        </BodyStyled>
      </Fade>
    </SectionStyled>
  );
};

interface HourCellProps {
  hour: ConditionsHour;
  metric: Metric;
}

const HourCell = ({ hour, metric }: HourCellProps) => (
  <>
    <IconSlotStyled>
      <MetricIcon hour={hour} metric={metric} />
    </IconSlotStyled>
    <ValueStyled variant="body2">
      {hourValueOf(hour, metric) ?? '—'}
    </ValueStyled>
  </>
);

const MetricIcon = ({ hour, metric }: HourCellProps) => {
  switch (metric) {
    case 'score':
      return <VerdictStyled>{verdictOf(hour.band) ?? '—'}</VerdictStyled>;
    case 'precipitation':
      return (
        <PrecipitationIcon
          mm={hour.precipitationMm}
          weatherCode={hour.weatherCode}
          size={HOUR_ICON_PX}
        />
      );
    case 'wind':
      return (
        <WindIcon metresPerSecond={hour.windSpeedMs} size={HOUR_ICON_PX} />
      );
    default:
      return (
        <WeatherIcon
          size={HOUR_ICON_PX}
          kind={weatherKindOf(hour.weatherCode, hour.precipitationMm)}
        />
      );
  }
};

const SectionStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const HeaderStyled = styled('div')`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const GridStyled = styled('div')`
  display: flex;
  gap: ${({ theme }) => theme.spacing(0.5)};
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ColumnStyled = styled('div')`
  display: flex;
  min-width: 32px;
  flex: 1 1 0;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const IconSlotStyled = styled('div')`
  display: flex;
  height: 40px;
  align-items: center;
`;

const VerdictStyled = styled('span')`
  font-size: ${({ theme }) => theme.typography.h6.fontSize};
  line-height: 1;
`;

const ValueStyled = styled(Typography)`
  display: flex;
  align-items: baseline;
  gap: 1px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
`;

const BodyStyled = styled('div')`
  display: flex;
  min-width: 0;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const LegendStyled = styled('div')`
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(0.5)};
  border-right: 1px solid ${({ theme }) => theme.palette.divider};
`;

const LegendLabelStyled = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.disabled};
  white-space: nowrap;
`;
