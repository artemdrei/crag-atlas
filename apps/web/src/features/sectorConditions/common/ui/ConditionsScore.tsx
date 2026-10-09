import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { getScoreColor } from '@web/shared/theme/palette';
import { SunTimes } from '@web/shared/ui';

import type { ConditionsDay } from '../entities';
import { useBandLabel } from '../hooks';
import { sunShadeOf, verdictOf } from '../lib';

export interface Props {
  day: ConditionsDay;
  isSunKnown: boolean;
}

export const ConditionsScore = ({ day, isSunKnown }: Props) => {
  const bandLabel = useBandLabel();
  const sunShade = sunShadeOf(day);
  const verdict = verdictOf(day.band);

  return (
    <RowStyled>
      <RingStyled band={day.band}>
        <Typography variant="h4">{day.score ?? '—'}</Typography>
        {verdict && <BadgeStyled>{verdict}</BadgeStyled>}
      </RingStyled>

      <ColumnStyled>
        <BandStyled variant="h6" band={day.band}>
          {bandLabel(day.band) ?? (
            <Trans>Weather forecast not available yet</Trans>
          )}
        </BandStyled>

        {day.sunriseAt && day.sunsetAt && (
          <SunTimes
            variant="body2"
            sunrise={day.sunriseAt}
            sunset={day.sunsetAt}
          />
        )}

        {isSunKnown && (
          <Typography variant="body2">
            {sunShade.isNever && <Trans>Sector in the shade all day</Trans>}
            {sunShade.isAllDay && <Trans>Sector in the sun all day</Trans>}
            {!sunShade.isNever && !sunShade.isAllDay && (
              <Trans>
                Sector in the sun roughly {sunShade.firstSunAt} –{' '}
                {sunShade.lastSunAt}
              </Trans>
            )}
          </Typography>
        )}
      </ColumnStyled>
    </RowStyled>
  );
};

const RowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

// A plain ring rather than a progress track: the number is the message and a
// sweep would read as something still loading.
const RingStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'band'
})<{ band: ConditionsDay['band'] }>`
  position: relative;
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 84px;
  height: 84px;
  border: 3px solid
    ${({ theme, band }) =>
      getScoreColor(theme.palette.conditionBand, band) ??
      theme.palette.divider};
  border-radius: 50%;
  font-variant-numeric: tabular-nums;
`;

// Sat on the ring rather than inside it: the number owns the middle, and a
// badge breaking the circle reads as a stamp on the verdict.
const BadgeStyled = styled('span')`
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.palette.background.paper};
  font-size: ${({ theme }) => theme.typography.h5.fontSize};
  line-height: 1;
  transform: translate(25%, 25%);
`;

const ColumnStyled = styled('div')`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.25)};
`;

const BandStyled = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'band'
})<{ band: ConditionsDay['band'] }>`
  color: ${({ theme, band }) =>
    getScoreColor(theme.palette.conditionBand, band) ??
    theme.palette.text.secondary};
`;
