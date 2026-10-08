import { Trans } from '@lingui/react/macro';
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useIsOnline } from '@web/shared/lib';

export const OfflineBanner = () => {
  const isOnline = useIsOnline();

  if (isOnline) return null;

  return (
    <BannerStyled role="status">
      <CloudOffOutlinedIcon fontSize="inherit" />
      <Typography variant="caption">
        <Trans>You are offline — showing saved data</Trans>
      </Typography>
    </BannerStyled>
  );
};

const BannerStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(0.75)};
  padding: ${({ theme }) => theme.spacing(0.5, 2)};
  font-size: 1rem;
  color: ${({ theme }) => theme.palette.text.primary};
  background-color: ${({ theme }) => theme.palette.action.selected};
`;
