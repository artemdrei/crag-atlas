import { Link, useLocation } from 'react-router';

import { Trans } from '@lingui/react/macro';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import PersonIcon from '@mui/icons-material/Person';
import TerrainIcon from '@mui/icons-material/Terrain';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { keyframes, styled } from '@mui/material/styles';

import { ROUTES } from '@web/app/router/routes';

export const AppBottomNavigation = () => {
  const location = useLocation();

  const section = [ROUTES.PROFILE, ROUTES.LOGBOOK].find((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <NavPaperStyled elevation={2}>
      <BottomNavigationStyled showLabels value={section ?? ROUTES.INDEX}>
        {/* Links, not buttons: each one goes to a page, and every page here
            is readable signed out. */}
        <BottomNavigationAction
          label={<Trans>Crags</Trans>}
          value={ROUTES.INDEX}
          icon={<TerrainIcon />}
          component={Link}
          to={ROUTES.INDEX}
        />
        <BottomNavigationAction
          label={<Trans>Logbook</Trans>}
          value={ROUTES.LOGBOOK}
          icon={<BookmarkIcon />}
          component={Link}
          to={ROUTES.LOGBOOK}
        />
        <BottomNavigationAction
          label={<Trans>Profile</Trans>}
          value={ROUTES.PROFILE}
          icon={<PersonIcon />}
          component={Link}
          to={ROUTES.PROFILE}
        />
      </BottomNavigationStyled>
    </NavPaperStyled>
  );
};

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const NavPaperStyled = styled(Paper)`
  border-radius: 24px 24px 0 0;
  overflow: hidden;
  padding-bottom: env(safe-area-inset-bottom);
  animation: ${fadeIn} 0.3s ease-in-out;
`;

const BottomNavigationStyled = styled(BottomNavigation)`
  border-top: 1px solid ${({ theme }) => theme.palette.divider};
`;
