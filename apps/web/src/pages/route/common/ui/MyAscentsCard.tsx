import { Plural, Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { TickActionsButton } from '@web/features/logTick';
import { AscentTypeBadge } from '@web/shared/ui';

import { useApiGetRouteTicks } from '../hooks';

export interface Props {
  idRoute: string;
}

export const MyAscentsCard = ({ idRoute }: Props) => {
  const { ticks, isLoading } = useApiGetRouteTicks(idRoute);

  if (isLoading || ticks.length === 0) return null;

  return (
    <CardStyled>
      <HeaderRowStyled>
        <TitleStyled variant="overline" color="text.secondary">
          <Trans>My ascents</Trans>
        </TitleStyled>
        <Typography variant="caption" color="text.secondary">
          <Plural value={ticks.length} one="# entry" other="# entries" />
        </Typography>
      </HeaderRowStyled>
      {ticks.map((tick) => (
        <EntryStyled key={tick.id}>
          <EntryHeaderStyled>
            <AscentTypeBadge ascentType={tick.ascentType} />
            <Typography variant="body2">{tick.climbedAt}</Typography>
            <SpacerStyled />
            {!!tick.attempts && (
              <Typography variant="caption" color="text.secondary">
                <Plural value={tick.attempts} one="# try" other="# tries" />
              </Typography>
            )}
            <TickActionsButton tick={tick} />
          </EntryHeaderStyled>
          {!!tick.note && (
            <Typography variant="body2" color="text.secondary">
              {tick.note}
            </Typography>
          )}
        </EntryStyled>
      ))}
    </CardStyled>
  );
};

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
