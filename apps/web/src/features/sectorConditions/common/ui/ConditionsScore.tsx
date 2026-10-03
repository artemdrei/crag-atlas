import { Trans } from '@lingui/react/macro';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { getScoreColor } from '@web/shared/theme/palette';

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
        {verdict && <VerdictStyled>{verdict}</VerdictStyled>}
      </RingStyled>

      <ColumnStyled>
        <BandStyled variant="h6" band={day.band}>
          {bandLabel(day.band) ?? (
            <Trans>Weather forecast not available yet</Trans>
          )}
        </BandStyled>

        {day.bestFromAt && day.bestUntilAt && (
          <Typography variant="body2" color="text.secondary">
            <Trans>
              best {day.bestFromAt} – {day.bestUntilAt}
            </Trans>
          </Typography>
        )}

        {isSunKnown && (
          <SunLineStyled variant="body2">
            {sunShade.isNever && (
              <>
                <DarkModeIcon fontSize="inherit" />
                <Trans>In the shade all day</Trans>
              </>
            )}
            {sunShade.isAllDay && (
              <>
                <WbSunnyIcon fontSize="inherit" />
                <Trans>In the sun all day</Trans>
              </>
            )}
            {!sunShade.isNever && !sunShade.isAllDay && (
              <>
                <WbSunnyIcon fontSize="inherit" />
                <Trans>
                  Sun roughly {sunShade.firstSunAt} – {sunShade.lastSunAt}
                </Trans>
              </>
            )}
          </SunLineStyled>
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
const VerdictStyled = styled('span')`
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.palette.background.paper};
  font-size: ${({ theme }) => theme.typography.h6.fontSize};
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

const SunLineStyled = styled(Typography)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.75)};
  color: ${({ theme }) => theme.palette.secondary.main};
`;
