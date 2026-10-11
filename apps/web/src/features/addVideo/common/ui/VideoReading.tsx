import { Trans } from '@lingui/react/macro';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const VideoReading = () => (
  <ReadingStyled>
    <RowStyled>
      <ThumbSkeletonStyled variant="rounded" />
      <LinesStyled>
        <Skeleton width="80%" />
        <Skeleton width="50%" />
      </LinesStyled>
    </RowStyled>
    <StatusStyled>
      <CircularProgress size={16} />
      <Typography variant="body2" color="text.secondary">
        <Trans>Reading the video…</Trans>
      </Typography>
    </StatusStyled>
  </ReadingStyled>
);

const ReadingStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const RowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const ThumbSkeletonStyled = styled(Skeleton)`
  flex: 0 0 auto;
  width: 96px;
  height: 54px;
`;

const LinesStyled = styled('div')`
  flex: 1 1 auto;
`;

const StatusStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;
