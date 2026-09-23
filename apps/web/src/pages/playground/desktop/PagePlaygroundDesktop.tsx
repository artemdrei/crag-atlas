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

export const PagePlaygroundDesktop = () => (
  <PageStyled>
    <Typography variant="h4">Playground</Typography>
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
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(4)};
`;
