import { useLingui } from '@lingui/react/macro';

export const useWeatherFailureMessage = () => {
  const { t } = useLingui();

  return (code: string | null | undefined): string => {
    if (code === 'WEATHER_FETCH_FAILED') {
      return t`The weather service is unavailable right now`;
    }

    if (code === 'WEATHER_DATE_UNAVAILABLE') {
      return t`No forecast is published that far ahead`;
    }

    return t`Could not load the weather`;
  };
};
