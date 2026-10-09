import clearDayAnimated from '@meteocons/svg/monochrome/clear-day.svg';
import cloudyAnimated from '@meteocons/svg/monochrome/cloudy.svg';
import drizzleAnimated from '@meteocons/svg/monochrome/drizzle.svg';
import fogAnimated from '@meteocons/svg/monochrome/fog.svg';
import partlyCloudyDayAnimated from '@meteocons/svg/monochrome/partly-cloudy-day.svg';
import rainAnimated from '@meteocons/svg/monochrome/rain.svg';
import snowAnimated from '@meteocons/svg/monochrome/snow.svg';
import thunderstormsDayRainAnimated from '@meteocons/svg/monochrome/thunderstorms-day-rain.svg';
import clearDay from '@meteocons/svg-static/monochrome/clear-day.svg';
import cloudy from '@meteocons/svg-static/monochrome/cloudy.svg';
import drizzle from '@meteocons/svg-static/monochrome/drizzle.svg';
import fog from '@meteocons/svg-static/monochrome/fog.svg';
import partlyCloudyDay from '@meteocons/svg-static/monochrome/partly-cloudy-day.svg';
import rain from '@meteocons/svg-static/monochrome/rain.svg';
import raindrop from '@meteocons/svg-static/monochrome/raindrop.svg';
import raindrops from '@meteocons/svg-static/monochrome/raindrops.svg';
import snow from '@meteocons/svg-static/monochrome/snow.svg';
import snowflake from '@meteocons/svg-static/monochrome/snowflake.svg';
import thunderstormsDayRain from '@meteocons/svg-static/monochrome/thunderstorms-day-rain.svg';
import windsock from '@meteocons/svg-static/monochrome/windsock.svg';
import windsockCalm from '@meteocons/svg-static/monochrome/windsock-calm.svg';
import windsockModerate from '@meteocons/svg-static/monochrome/windsock-moderate.svg';
import windsockWeak from '@meteocons/svg-static/monochrome/windsock-weak.svg';
import { styled } from '@mui/material/styles';

import type { PrecipitationKind, WeatherKind } from '../lib';
import { precipitationKindOf, toKmh } from '../lib';

const ICONS: Record<WeatherKind, string> = {
  clear: clearDay,
  partlyCloudy: partlyCloudyDay,
  cloudy,
  fog,
  drizzle,
  rain,
  snow,
  thunder: thunderstormsDayRain
};

const ANIMATED_ICONS: Record<WeatherKind, string> = {
  clear: clearDayAnimated,
  partlyCloudy: partlyCloudyDayAnimated,
  cloudy: cloudyAnimated,
  fog: fogAnimated,
  drizzle: drizzleAnimated,
  rain: rainAnimated,
  snow: snowAnimated,
  thunder: thunderstormsDayRainAnimated
};

const PRECIPITATION_ICONS: Record<PrecipitationKind, string> = {
  dry: raindrop,
  drizzle: raindrop,
  rain: raindrops,
  snow: snowflake
};

const CALM_KMH = 5;
const WEAK_KMH = 15;
const MODERATE_KMH = 25;

export interface Props {
  kind: WeatherKind | null;
  size: number;
  isAnimated?: boolean;
}

export const WeatherIcon = ({ kind, size, isAnimated }: Props) => {
  if (!kind) return <UnknownStyled size={size} />;

  return (
    <ImageStyled
      alt=""
      src={(isAnimated ? ANIMATED_ICONS : ICONS)[kind]}
      size={size}
    />
  );
};

const ImageStyled = styled('img', {
  shouldForwardProp: (prop) => prop !== 'size' && prop !== 'isMuted'
})<{ size: number; isMuted?: boolean }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  flex: 0 0 auto;
  opacity: ${({ isMuted }) => (isMuted ? 0.35 : 1)};
  filter: ${({ theme }) => (theme.palette.mode === 'dark' ? 'invert(1)' : 'none')};
`;

const UnknownStyled = styled('span', {
  shouldForwardProp: (prop) => prop !== 'size'
})<{ size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  flex: 0 0 auto;
`;

interface PrecipitationProps {
  mm: number | null;
  weatherCode: number | null;
  size: number;
}

export const PrecipitationIcon = ({
  mm,
  weatherCode,
  size
}: PrecipitationProps) => {
  if (mm == null) return <UnknownStyled size={size} />;

  const kind = precipitationKindOf(weatherCode, mm);

  return (
    <ImageStyled
      alt=""
      src={PRECIPITATION_ICONS[kind]}
      size={size}
      isMuted={kind === 'dry'}
    />
  );
};

interface WindProps {
  metresPerSecond: number | null;
  size: number;
}

const windsockOf = (kmh: number): string => {
  if (kmh < CALM_KMH) return windsockCalm;
  if (kmh < WEAK_KMH) return windsockWeak;
  if (kmh < MODERATE_KMH) return windsockModerate;

  return windsock;
};

export const WindIcon = ({ metresPerSecond, size }: WindProps) => {
  if (metresPerSecond == null) return <UnknownStyled size={size} />;

  return (
    <ImageStyled alt="" src={windsockOf(toKmh(metresPerSecond))} size={size} />
  );
};
