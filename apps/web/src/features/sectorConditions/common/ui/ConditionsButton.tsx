import { useLingui } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

import { useModal } from '@web/app/providers';
import { trackListControl } from '@web/shared/lib';

import type { ConditionsPlace } from '../entities';
import { useApiGetPlaceForecast, useCurrentWeather } from '../hooks';
import { WeatherIcon } from './WeatherIcons';

const WEATHER_ICON_PX = 28;

export interface Props {
  place: ConditionsPlace;
}

export const ConditionsButton = ({ place }: Props) => {
  const { t } = useLingui();
  const { openModal } = useModal();
  const { conditions } = useApiGetPlaceForecast(place);
  const current = useCurrentWeather(conditions);

  if (!current) return null;

  const open = () => {
    trackListControl(place.list, 'conditions_expand', 'open');
    openModal('CONDITIONS', { place });
  };

  return (
    <ButtonStyled
      color="inherit"
      aria-label={t`Weather`}
      startIcon={<WeatherIcon kind={current.kind} size={WEATHER_ICON_PX} />}
      onClick={open}
    >
      {current.temperatureC}°
    </ButtonStyled>
  );
};

const ButtonStyled = styled(Button)`
  flex-shrink: 0;
  min-width: 0;
  border-radius: 999px;
  font-variant-numeric: tabular-nums;

  .MuiButton-startIcon {
    margin-right: ${({ theme }) => theme.spacing(0.5)};
  }
`;
