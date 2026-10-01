import { track } from '@crag-atlas/analytics';
import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';

import { useModal, useUser } from '@web/app/providers';
import type { TickHeader } from '@web/features/logTick';

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
    <Button variant="contained" onClick={handleClick}>
      <Trans>Log ascent</Trans>
    </Button>
  );
};
