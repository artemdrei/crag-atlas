import { useLingui } from '@lingui/react/macro';
import ButtonBase from '@mui/material/ButtonBase';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { getScoreColor } from '@web/shared/theme/palette';
import { hoverRing } from '@web/shared/theme/surfaces';

import type { ConditionsDay } from '../entities';
import { dayNumber, weekdayLabel } from '../lib';

export interface Props {
  date: string;
  days: ConditionsDay[];
  onSelect: (date: string) => void;
}

export const ConditionsDayStrip = ({ date, days, onSelect }: Props) => {
  const { t, i18n } = useLingui();

  return (
    <StripStyled>
      {days.map((day, index) => (
        <ChipStyled
          key={day.date}
          isSelected={day.date === date}
          onClick={() => onSelect(day.date)}
        >
          <DayStyled variant="caption">
            {index === 0 ? t`today` : weekdayLabel(day.date, i18n.locale)}{' '}
            <DateStyled>{dayNumber(day.date)}</DateStyled>
          </DayStyled>
          <ScoreStyled variant="subtitle1" band={day.band}>
            {day.score ?? '—'}
          </ScoreStyled>
        </ChipStyled>
      ))}
    </StripStyled>
  );
};

const StripStyled = styled('div')`
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  gap: ${({ theme }) => theme.spacing(1)};
  overflow-x: auto;
  padding-bottom: ${({ theme }) => theme.spacing(0.5)};
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ChipStyled = styled(ButtonBase, {
  shouldForwardProp: (prop) => prop !== 'isSelected'
})<{ isSelected: boolean }>`
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.25)};
  width: 76px;
  padding: ${({ theme }) => theme.spacing(1, 0.5)};
  border: 2px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.palette.primary.main : theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  background-color: ${({ theme }) => theme.palette.background.paper};

  &:hover {
    ${({ theme }) => hoverRing(theme.palette.primary.main)}
    background-color: ${({ theme }) => theme.palette.action.hover};
  }
`;

const DayStyled = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const DateStyled = styled('span')`
  color: ${({ theme }) => theme.palette.text.disabled};
`;

// The number carries the colour, so a glance down the strip finds the good
// day before a single score is read.
const ScoreStyled = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'band'
})<{ band: ConditionsDay['band'] }>`
  color: ${({ theme, band }) =>
    getScoreColor(theme.palette.conditionBand, band) ??
    theme.palette.text.disabled};
  font-variant-numeric: tabular-nums;
`;
