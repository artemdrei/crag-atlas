import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import {
  AscentTypePlayground,
  ControlsPlayground,
  FeedbackPlayground,
  GradePlayground,
  ModalPlayground,
  ToastPlayground
} from '../common';

export const PagePlaygroundMobile = () => (
  <PageStyled>
    <Typography variant="h5">Playground</Typography>
    <Typography variant="body2" color="text.secondary">
      Internal page: not linked from anywhere, reachable by URL only.
    </Typography>

    <ToastPlayground />
    <ModalPlayground />
    <GradePlayground />
    <AscentTypePlayground />
    <FeedbackPlayground />
    <ControlsPlayground />
  </PageStyled>
);

const PageStyled = styled('div')`
  padding: ${({ theme }) => theme.spacing(2)};
`;
