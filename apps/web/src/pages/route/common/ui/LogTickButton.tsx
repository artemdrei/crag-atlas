import { useLocation, useNavigate } from 'react-router';

import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';

import { useModal, useUser } from '@web/app/providers';
import { ROUTES } from '@web/app/router/routes';
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
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useUser();
  const { openModal } = useModal();

  const handleClick = () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: location.pathname } });
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
