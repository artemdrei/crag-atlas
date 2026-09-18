import { useNavigate } from 'react-router';

import { Trans } from '@lingui/react/macro';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import MapIcon from '@mui/icons-material/Map';
import PersonIcon from '@mui/icons-material/Person';
import TerrainIcon from '@mui/icons-material/Terrain';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';

import { ROUTES } from '@web/app/router/routes';

export const AppBottomNavigation = () => {
  const navigate = useNavigate();

  return (
    <BottomNavigation
      showLabels
      value={ROUTES.INDEX}
      sx={{ borderTop: 1, borderColor: 'divider' }}
    >
      <BottomNavigationAction
        label={<Trans>Crags</Trans>}
        value={ROUTES.INDEX}
        icon={<TerrainIcon />}
        onClick={() => navigate(ROUTES.INDEX)}
      />
      <BottomNavigationAction
        label={<Trans>Map</Trans>}
        icon={<MapIcon />}
        disabled
      />
      <BottomNavigationAction
        label={<Trans>Logbook</Trans>}
        icon={<BookmarkIcon />}
        disabled
      />
      <BottomNavigationAction
        label={<Trans>Profile</Trans>}
        icon={<PersonIcon />}
        disabled
      />
    </BottomNavigation>
  );
};
