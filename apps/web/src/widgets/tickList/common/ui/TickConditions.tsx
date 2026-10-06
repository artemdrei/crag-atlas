import type { TickWeather } from '@crag-atlas/api';
import { Trans } from '@lingui/react/macro';
import AirIcon from '@mui/icons-material/Air';
import GrainIcon from '@mui/icons-material/Grain';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { styled } from '@mui/material/styles';

import { IconValue } from '@web/shared/ui';

export interface Props {
  weather: TickWeather;
}

export const TickConditions = ({ weather }: Props) => (
  <RowStyled>
    {weather.temperatureC != null && (
      <IconValue icon={<ThermostatIcon fontSize="small" color="warning" />}>
        {weather.temperatureC}°
      </IconValue>
    )}
    {weather.humidityPct != null && (
      <IconValue icon={<WaterDropIcon fontSize="small" color="info" />}>
        {weather.humidityPct}%
      </IconValue>
    )}
    {weather.precipitation24hMm != null && (
      <IconValue icon={<GrainIcon fontSize="small" color="info" />}>
        <Trans>{weather.precipitation24hMm} mm / 24 h</Trans>
      </IconValue>
    )}
    {weather.windSpeedMs != null && (
      <IconValue icon={<AirIcon fontSize="small" color="disabled" />}>
        <Trans>{weather.windSpeedMs} m/s</Trans>
      </IconValue>
    )}
  </RowStyled>
);

const RowStyled = styled('div')`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding-top: ${({ theme }) => theme.spacing(1.5)};
  border-top: 1px solid ${({ theme }) => theme.palette.divider};
`;
