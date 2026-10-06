import { Link, Navigate } from 'react-router';

import { Trans, useLingui } from '@lingui/react/macro';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';

import { ROUTES } from '@web/app/router/routes';
import { EmptyState } from '@web/shared/ui';

import { useQrRedirect } from '../hooks';

export const QrRedirect = () => {
  const { t } = useLingui();
  const { sectorPath, isLoading, isMissing } = useQrRedirect();

  if (sectorPath) return <Navigate to={sectorPath} replace />;

  return (
    <CenterStyled>
      {isLoading && <CircularProgress aria-label={t`Opening the sector`} />}
      {isMissing && (
        <>
          <EmptyState
            icon={<QrCode2Icon />}
            message={<Trans>This QR code does not lead to a sector.</Trans>}
          />
          <Button variant="contained" component={Link} to={ROUTES.INDEX}>
            <Trans>Open the crags</Trans>
          </Button>
        </>
      )}
    </CenterStyled>
  );
};

const CenterStyled = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  min-height: 60dvh;
  padding: ${({ theme }) => theme.spacing(3)};
`;
