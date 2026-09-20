import { Plural, Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import type { AscentStyle } from '@web/shared/ui';
import { AscentStyleLabel } from '@web/shared/ui';

interface MyAscent {
  id: string;
  climbedAt: string;
  ascentStyle: AscentStyle;
  attempts: number;
  note: string;
}

/** Demo data until the API serves the signed-in climber's ascents. */
const DEMO_MY_ASCENTS: MyAscent[] = [
  {
    id: 'rp',
    climbedAt: '2026-09-16',
    ascentStyle: 'redpoint',
    attempts: 7,
    note: 'Finally. The crux went off the left-hand crimp, as Maria suggested. Cool morning, the holds felt better.'
  },
  {
    id: 'try',
    climbedAt: '2026-09-09',
    ascentStyle: 'attempt',
    attempts: 3,
    note: 'Fell three times leaving the roof. Sequence is dialled, endurance is not.'
  }
];

export const MyAscentsCard = () => (
  <CardStyled>
    <HeaderRowStyled>
      <TitleStyled variant="overline" color="text.secondary">
        <Trans>My ascents</Trans>
      </TitleStyled>
      <Typography variant="caption" color="text.secondary">
        <Plural
          value={DEMO_MY_ASCENTS.length}
          one="# entry"
          other="# entries"
        />
      </Typography>
    </HeaderRowStyled>
    {DEMO_MY_ASCENTS.map((ascent) => (
      <EntryStyled key={ascent.id}>
        <EntryHeaderStyled>
          <AscentStyleLabel ascentStyle={ascent.ascentStyle} />
          <Typography variant="body2">{ascent.climbedAt}</Typography>
          <SpacerStyled />
          <Typography variant="caption" color="text.secondary">
            <Plural value={ascent.attempts} one="# try" other="# tries" />
          </Typography>
        </EntryHeaderStyled>
        <Typography variant="body2" color="text.secondary">
          {ascent.note}
        </Typography>
      </EntryStyled>
    ))}
  </CardStyled>
);

const CardStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const TitleStyled = styled(Typography)`
  letter-spacing: 0.08em;
`;

const EntryStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const EntryHeaderStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const SpacerStyled = styled('span')`
  flex-grow: 1;
`;
