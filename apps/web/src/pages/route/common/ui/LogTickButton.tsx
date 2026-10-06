import { Plural, Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

import { useRouteSends } from '@web/features/logTick';

import { type LogTickTarget, useOpenLogTick } from '../hooks';

export type Props = LogTickTarget;

export const LogTickButton = (target: Props) => {
  const { sendCount } = useRouteSends(target.idRoute);
  const handleClick = useOpenLogTick(target);
  const isSent = sendCount > 0;

  return (
    <Button
      variant="contained"
      color={isSent ? 'success' : 'primary'}
      fullWidth
      data-testid="log-tick"
      onClick={handleClick}
    >
      {isSent ? (
        <>
          <Trans>Log repeat</Trans>{' '}
          <CountStyled>
            <Trans>
              (Sent · <Plural value={sendCount} one="# time" other="# times" />)
            </Trans>
          </CountStyled>
        </>
      ) : (
        <Trans>Log ascent</Trans>
      )}
    </Button>
  );
};

const CountStyled = styled('span')`
  margin-left: ${({ theme }) => theme.spacing(0.75)};
`;
