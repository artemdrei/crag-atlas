import { Trans } from '@lingui/react/macro';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';

export const PageSectorEditMobile = () => (
  <PageStyled>
    <Alert severity="info">
      <Trans>The topo editor is available on a desktop screen.</Trans>
    </Alert>
  </PageStyled>
);

const PageStyled = styled('div')`
  padding: ${({ theme }) => theme.spacing(2)};
`;
