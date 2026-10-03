import { Link } from 'react-router';

import { useLingui } from '@lingui/react/macro';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import Refresh from '@mui/icons-material/Refresh';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Props {
  name: string;
  path: string;
  details: string;
  isRefreshing: boolean;
  isRefreshDisabled: boolean;
  onRefresh: () => void;
  onDelete: () => void;
}

export const OfflineRegionRow = ({
  name,
  path,
  details,
  isRefreshing,
  isRefreshDisabled,
  onRefresh,
  onDelete
}: Props) => {
  const { t } = useLingui();

  return (
    <RowStyled>
      <TextStyled>
        <NameStyled to={path}>{name}</NameStyled>
        <Typography variant="caption" color="text.secondary">
          {details}
        </Typography>
      </TextStyled>

      <IconButton
        aria-label={t`Refresh`}
        disabled={isRefreshDisabled}
        onClick={onRefresh}
      >
        {isRefreshing ? <CircularProgress size={20} /> : <Refresh />}
      </IconButton>
      <IconButton
        aria-label={t`Remove`}
        disabled={isRefreshing}
        onClick={onDelete}
      >
        <DeleteOutlined />
      </IconButton>
    </RowStyled>
  );
};

const RowStyled = styled('li')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const TextStyled = styled('div')`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
`;

const NameStyled = styled(Link)`
  overflow: hidden;
  color: ${({ theme }) => theme.palette.text.primary};
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
