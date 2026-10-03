import { Trans } from '@lingui/react/macro';
import UmbrellaIcon from '@mui/icons-material/Umbrella';
import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import type { ConditionsDay, SectorConditions } from '../entities';
import { isSunKnown, representativeHour } from '../lib';
import { ConditionsHourly } from './ConditionsHourly';
import { ConditionsReadings } from './ConditionsReadings';
import { ConditionsScore } from './ConditionsScore';

export interface Props {
  conditions: SectorConditions;
  day: ConditionsDay;
}

export const ConditionsCard = ({ conditions, day }: Props) => {
  const hour = representativeHour(day);

  return (
    <BodyStyled>
      {conditions.shelter !== 'open' && (
        <Chip
          size="small"
          variant="outlined"
          icon={<UmbrellaIcon fontSize="small" />}
          label={
            conditions.shelter === 'full' ? (
              <Trans>Sheltered · dry in rain</Trans>
            ) : (
              <Trans>Partly sheltered</Trans>
            )
          }
        />
      )}

      <ConditionsScore day={day} isSunKnown={isSunKnown(conditions)} />

      {hour && day.hasForecast && <ConditionsReadings hour={hour} />}

      {!day.hasForecast && (
        <Typography variant="body2" color="text.secondary">
          <Trans>Weather forecast not available yet</Trans>
        </Typography>
      )}

      <ConditionsHourly hours={day.hours} />

      <AttributionStyled variant="caption" color="text.disabled">
        <Trans>Weather by Open-Meteo.com</Trans>
      </AttributionStyled>
    </BodyStyled>
  );
};

const BodyStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const AttributionStyled = styled(Typography)`
  text-align: right;
`;
