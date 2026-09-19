import { useLocation, useNavigate } from 'react-router';

import { Trans } from '@lingui/react/macro';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import MapIcon from '@mui/icons-material/Map';
import PersonIcon from '@mui/icons-material/Person';
import TerrainIcon from '@mui/icons-material/Terrain';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { keyframes, styled } from '@mui/material/styles';

import { useUser } from '@web/app/providers';
import { ROUTES } from '@web/app/router/routes';

export const AppBottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useUser();

  const section = [ROUTES.PROFILE, ROUTES.LOGBOOK].find((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <NavPaperStyled elevation={2}>
      <BottomNavigationStyled showLabels value={section ?? ROUTES.INDEX}>
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
          value={ROUTES.LOGBOOK}
          icon={<BookmarkIcon />}
          onClick={() =>
            navigate(isAuthenticated ? ROUTES.LOGBOOK : ROUTES.LOGIN)
          }
        />
        <BottomNavigationAction
          label={<Trans>Profile</Trans>}
          value={ROUTES.PROFILE}
          icon={<PersonIcon />}
          onClick={() =>
            navigate(isAuthenticated ? ROUTES.PROFILE : ROUTES.LOGIN)
          }
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
