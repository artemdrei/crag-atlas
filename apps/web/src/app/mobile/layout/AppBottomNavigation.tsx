import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';

import { useNavigate } from 'react-router';

import { ROUTES } from '@web/app/router/routes';

export const AppBottomNavigation = () => {
  const navigate = useNavigate();

  return (
    <BottomNavigation showLabels value={ROUTES.INDEX}>
      <BottomNavigationAction
        label="Home"
        value={ROUTES.INDEX}
        icon={<HomeIcon />}
        onClick={() => navigate(ROUTES.INDEX)}
      />
    </BottomNavigation>
  );
};
