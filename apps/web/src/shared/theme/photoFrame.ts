import type { Theme } from '@mui/material/styles';

const ELEVATION = 3;

export const photoFrame = (theme: Theme) => `
  border-radius: ${theme.shape.borderRadius}px;
  box-shadow: 0 0 0 1px ${theme.palette.divider}, ${theme.shadows[ELEVATION]};
`;

/** The box a photo measures itself against. It owes the photo a real height:
    `container-type: size` is what lets `photoFit` cap the photo by this box
    while the frame around it still shrinks to the photo alone. */
export const photoStage = () => `
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  container-type: size;
`;

export const photoFit = (theme: Theme) => `
  display: block;
  width: auto;
  height: auto;
  max-width: 100cqw;
  max-height: 100cqh;
  ${photoFrame(theme)}
`;
