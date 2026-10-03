import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const AppVersion = () => {
  const version = __APP_VERSION__;

  return (
    <VersionStyled variant="caption" color="text.secondary">
      <Trans>Version {version}</Trans>
    </VersionStyled>
  );
};

const VersionStyled = styled(Typography)`
  text-align: center;
`;
