import type { ReactNode } from 'react';

import type { TickWeather } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import AirIcon from '@mui/icons-material/Air';
import GrainIcon from '@mui/icons-material/Grain';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { OPEN_METEO } from '@web/shared/api';
import { IconValue, SunTimes } from '@web/shared/ui';

import type { WeatherFieldName } from '../hooks';
import { TickFormSection } from './TickFormSection';
import { WeatherField } from './WeatherField';

type Translate = ReturnType<typeof useLingui>['t'];

interface Field {
  name: WeatherFieldName;
  icon: ReactNode;
  label: (t: Translate) => string;
  unit: (t: Translate) => string;
  min: number;
  max: number;
}

const FIELDS: Field[] = [
  {
    name: 'temperatureC',
    icon: <ThermostatIcon fontSize="small" color="warning" />,
    label: (t) => t`Temperature`,
    unit: (t) => t`°C`,
    min: -40,
    max: 50
  },
  {
    name: 'humidityPct',
    icon: <WaterDropIcon fontSize="small" color="info" />,
    label: (t) => t`Humidity`,
    unit: (t) => t`%`,
    min: 0,
    max: 100
  },
  {
    name: 'windSpeedMs',
    icon: <AirIcon fontSize="small" color="disabled" />,
    label: (t) => t`Wind`,
    unit: (t) => t`m/s`,
    min: 0,
    max: 60
  }
];

export interface Props {
  climbedAt: string;
  climbedAtTime: string;
  conditions: TickWeather | null;
  failureMessage: string | null;
  hasPoint: boolean;
  isLoading: boolean;
  isOffline: boolean;
  isEditsReset: boolean;
  isEdited: (field: WeatherFieldName) => boolean;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onFieldChange: (field: WeatherFieldName, value: number | null) => void;
  onFieldReset: (field: WeatherFieldName) => void;
}

export const ConditionsSection = ({
  climbedAt,
  climbedAtTime,
  conditions,
  failureMessage,
  hasPoint,
  isLoading,
  isOffline,
  isEditsReset,
  isEdited,
  onDateChange,
  onTimeChange,
  onFieldChange,
  onFieldReset
}: Props) => {
  const { t } = useLingui();

  return (
    <TickFormSection isFirst title={<Trans>When did you climb it?</Trans>}>
      <RowStyled>
        <TextField
          required
          fullWidth
          size="small"
          type="date"
          label={t`Date`}
          value={climbedAt}
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(event) => onDateChange(event.target.value)}
        />
        <TextField
          fullWidth
          size="small"
          type="time"
          label={t`Time`}
          value={climbedAtTime}
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(event) => onTimeChange(event.target.value)}
        />
      </RowStyled>

      <Typography variant="body2" color="text.secondary">
        {isOffline ? (
          <Trans>No weather while you are offline</Trans>
        ) : hasPoint ? (
          <Trans>Conditions, read at the sector</Trans>
        ) : (
          <Trans>The sector has no point — fill the conditions in</Trans>
        )}
      </Typography>

      {!isOffline &&
        (isLoading ? (
          <Skeleton variant="rounded" height={40} />
        ) : (
          <RowStyled>
            {FIELDS.map(({ name, icon, label, unit, min, max }) => (
              <WeatherField
                key={name}
                icon={icon}
                label={label(t)}
                unit={unit(t)}
                value={conditions?.[name]}
                min={min}
                max={max}
                isEdited={isEdited(name)}
                onChange={(value) => onFieldChange(name, value)}
                onReset={() => onFieldReset(name)}
              />
            ))}
          </RowStyled>
        ))}

      {failureMessage && (
        <Typography variant="caption" color="error">
          {failureMessage}
        </Typography>
      )}

      {isEditsReset && (
        <Typography variant="caption" color="warning.main">
          <Trans>Your corrections were reset for the new date and time</Trans>
        </Typography>
      )}

      {conditions && (
        <SummaryStyled>
          {conditions.dewPointC != null && (
            <IconValue
              isMuted
              variant="caption"
              icon={<WaterDropOutlinedIcon fontSize="small" color="info" />}
            >
              <Trans>dew {conditions.dewPointC}°</Trans>
            </IconValue>
          )}
          {conditions.precipitation24hMm != null && (
            <IconValue
              isMuted
              variant="caption"
              icon={<GrainIcon fontSize="small" color="info" />}
            >
              <Trans>{conditions.precipitation24hMm} mm / 24 h</Trans>
            </IconValue>
          )}
          {conditions.sunrise && conditions.sunset && (
            <SunStyled>
              <SunTimes
                variant="caption"
                sunrise={conditions.sunrise}
                sunset={conditions.sunset}
              />
            </SunStyled>
          )}
          {conditions.source === OPEN_METEO && (
            <AttributionStyled variant="caption" color="text.disabled">
              <Trans>Weather by Open-Meteo.com</Trans>
            </AttributionStyled>
          )}
        </SummaryStyled>
      )}
    </TickFormSection>
  );
};

const RowStyled = styled('div')`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1.5)};

  & > * {
    flex: 1 1 110px;
  }
`;

const SummaryStyled = styled('div')`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const SunStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  margin-left: auto;
`;

const AttributionStyled = styled(Typography)`
  width: 100%;
  text-align: right;
`;
