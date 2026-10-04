import { track } from '@crag-atlas/analytics';
import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useModal, useUser } from '@web/app/providers';
import { type TickHeader, useRouteSends } from '@web/features/logTick';

export interface Props extends TickHeader {
  idRoute: string;
}

export const LogTickButton = ({
  idRoute,
  routeName,
  routeGrade,
  routeGradeScale,
  place
}: Props) => {
  const { isAuthenticated } = useUser();
  const { openModal } = useModal();
  const { sendCount } = useRouteSends(idRoute);
  const isSent = sendCount > 0;

  const handleClick = () => {
    if (!isAuthenticated) {
      track({ name: 'Sign In Prompted', props: { action: 'tick' } });
      openModal('SIGN_IN_PROMPT');
      return;
    }

    openModal('LOG_TICK', {
      idRoute,
      routeName,
      routeGrade,
      routeGradeScale,
      place
    });
  };

  return (
    <WrapStyled>
      <Button
        variant="contained"
        color={isSent ? 'success' : 'primary'}
        onClick={handleClick}
      >
        {isSent ? <Trans>Log repeat</Trans> : <Trans>Log ascent</Trans>}
      </Button>
      {isSent && (
        <SentStyled variant="body2">
          <Trans>Sent ×{sendCount}</Trans>
        </SentStyled>
      )}
    </WrapStyled>
  );
};

const WrapStyled = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const SentStyled = styled(Typography)`
  color: ${({ theme }) => theme.palette.success.main};
  font-weight: 600;
`;
