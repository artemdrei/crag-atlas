import { useNavigate } from 'react-router';

import { Trans, useLingui } from '@lingui/react/macro';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { useProfileIdentity, useUser } from '@web/app/providers';
import { ROUTES } from '@web/app/router/routes';
import { getInitials } from '@web/shared/lib';
import { CONTENT_MAX_WIDTH } from '@web/shared/theme/layout';

export const AppHeaderDesktop = () => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useUser();
  const { avatarUrl, displayName } = useProfileIdentity();

  return (
    <HeaderStyled position="static" color="transparent" elevation={0}>
      <ToolbarStyled>
        <LogoStyled
          variant="h6"
          component="span"
          onClick={() => navigate(ROUTES.INDEX)}
        >
          Crag Atlas
        </LogoStyled>
        <Button color="inherit" onClick={() => navigate(ROUTES.INDEX)}>
          <Trans>Regions</Trans>
        </Button>
        <Button
          color="inherit"
          onClick={() =>
            navigate(isAuthenticated ? ROUTES.LOGBOOK : ROUTES.LOGIN)
          }
        >
          <Trans>My logbook</Trans>
        </Button>
        <SpacerStyled />
        {/* Dev-only shortcut: the route itself does not exist in a build. */}
        {import.meta.env.DEV && (
          <Button
            color="inherit"
            size="small"
            onClick={() => navigate(ROUTES.PLAYGROUND)}
          >
            Playground
          </Button>
        )}
        {!isLoading &&
          (isAuthenticated ? (
            <IconButton
              aria-label={t`Profile`}
              onClick={() => navigate(ROUTES.PROFILE)}
            >
              <AvatarStyled src={avatarUrl} alt={displayName}>
                {getInitials(displayName)}
              </AvatarStyled>
            </IconButton>
          ) : (
            <Button variant="outlined" onClick={() => navigate(ROUTES.LOGIN)}>
              <Trans>Sign in</Trans>
            </Button>
          ))}
      </ToolbarStyled>
    </HeaderStyled>
  );
};

const HeaderStyled = styled(AppBar)`
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

const ToolbarStyled = styled(Toolbar)`
  gap: 24px;
  width: 100%;
  max-width: ${CONTENT_MAX_WIDTH}px;
  margin: 0 auto;
`;

const LogoStyled = styled(Typography)`
  cursor: pointer;
` as typeof Typography;

const SpacerStyled = styled(Box)`
  flex-grow: 1;
`;

const AvatarStyled = styled(Avatar)`
  width: 32px;
  height: 32px;
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
`;
