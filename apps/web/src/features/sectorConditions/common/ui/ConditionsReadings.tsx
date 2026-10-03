import { Trans, useLingui } from '@lingui/react/macro';
import AirIcon from '@mui/icons-material/Air';
import GrainIcon from '@mui/icons-material/Grain';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { styled } from '@mui/material/styles';

import { IconValue } from '@web/shared/ui';

import type { ConditionsHour } from '../entities';
import { toKmh } from '../lib';

export interface Props {
  hour: ConditionsHour;
}

export const ConditionsReadings = ({ hour }: Props) => {
  const { t } = useLingui();

  return (
    <RowStyled>
      {hour.temperatureC != null && (
        <IconValue
          isMuted
          variant="body2"
          hint={t`Temperature`}
          icon={<ThermostatIcon fontSize="small" color="warning" />}
        >
          <Trans>{Math.round(hour.temperatureC)} °C</Trans>
        </IconValue>
      )}
      {hour.precipitationMm != null && (
        <IconValue
          isMuted
          variant="body2"
          hint={t`Precipitation`}
          icon={<GrainIcon fontSize="small" color="info" />}
        >
          <Trans>{hour.precipitationMm} mm</Trans>
        </IconValue>
      )}
      {hour.humidityPct != null && (
        <IconValue
          isMuted
          variant="body2"
          hint={t`Humidity`}
          icon={<WaterDropIcon fontSize="small" color="info" />}
        >
          <Trans>{Math.round(hour.humidityPct)}%</Trans>
        </IconValue>
      )}
      {hour.windSpeedMs != null && (
        <IconValue
          isMuted
          variant="body2"
          hint={t`Wind`}
          icon={<AirIcon fontSize="small" color="disabled" />}
        >
          <Trans>{toKmh(hour.windSpeedMs)} km/h</Trans>
        </IconValue>
      )}
    </RowStyled>
  );
};

const RowStyled = styled('div')`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;
