import LinearProgress from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Props {
  label: string;
  percent: number | null;
}

export const OfflineDownloadProgress = ({ label, percent }: Props) => (
  <ProgressStyled>
    <LinearProgress
      variant={percent === null ? 'indeterminate' : 'determinate'}
      value={percent ?? undefined}
    />
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </ProgressStyled>
);

const ProgressStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;
