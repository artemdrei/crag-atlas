import type { Theme } from '@mui/material/styles';

const ELEVATION = 3;

export const photoFrame = (theme: Theme) => `
  border-radius: ${theme.shape.borderRadius}px;
  box-shadow: 0 0 0 1px ${theme.palette.divider}, ${theme.shadows[ELEVATION]};
`;
