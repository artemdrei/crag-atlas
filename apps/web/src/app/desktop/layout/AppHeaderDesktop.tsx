import { Link } from 'react-router';

import { Trans, useLingui } from '@lingui/react/macro';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';

import { useProfileIdentity, useUser } from '@web/app/providers';
import { ROUTES } from '@web/app/router/routes';
import { useSignInLink } from '@web/app/router/useSignInLink';
import { CatalogSearchDesktop } from '@web/features/catalogSearch';
import { CONTENT_MAX_WIDTH } from '@web/shared/theme/layout';
import { SignInCta, UserAvatar, Wordmark } from '@web/shared/ui';

export const AppHeaderDesktop = ({ hasSearch }: { hasSearch?: boolean }) => {
  const { t } = useLingui();
  const { isAuthenticated, isLoading } = useUser();
  const { avatarUrl, displayName } = useProfileIdentity();
  const signInLink = useSignInLink();

  return (
    <HeaderStyled position="static" color="transparent" elevation={0}>
      <ToolbarStyled>
        <Wordmark to={ROUTES.INDEX} />
        <Button color="inherit" component={Link} to={ROUTES.INDEX}>
          <Trans>Regions</Trans>
        </Button>
        <Button color="inherit" component={Link} to={ROUTES.LOGBOOK}>
          <Trans>Logbook</Trans>
        </Button>
        <SpacerStyled />
        {hasSearch && (
          <SearchSlotStyled>
            <CatalogSearchDesktop />
          </SearchSlotStyled>
        )}
        {!isLoading &&
          (isAuthenticated ? (
            <IconButton
              aria-label={t`Profile`}
              component={Link}
              to={ROUTES.PROFILE}
            >
              <AvatarStyled name={displayName} avatarUrl={avatarUrl} />
            </IconButton>
          ) : (
            <SignInCta to={signInLink.to} from={signInLink.from} />
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

const AvatarStyled = styled(UserAvatar)`
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
`;

const SpacerStyled = styled(Box)`
  flex-grow: 1;
`;

const SearchSlotStyled = styled(Box)`
  flex-shrink: 0;
`;
