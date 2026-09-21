import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Props {
  currentUrl: string;
  nextUrl: string;
}

export const PhotoSwap = ({ currentUrl, nextUrl }: Props) => (
  <PairStyled>
    <PaneStyled>
      <Typography variant="subtitle2">
        <Trans>Current photo</Trans>
      </Typography>
      <ViewportStyled>
        <img src={currentUrl} alt="" />
      </ViewportStyled>
    </PaneStyled>
    <PaneStyled>
      <Typography variant="subtitle2" color="primary">
        <Trans>New photo</Trans>
      </Typography>
      <ViewportStyled>
        <img src={nextUrl} alt="" />
      </ViewportStyled>
    </PaneStyled>
  </PairStyled>
);

const PairStyled = styled('div')`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing(2)};
`;

const PaneStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  min-width: 0;
`;

const ViewportStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  height: min(46vh, 420px);
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  background: ${({ theme }) => theme.palette.action.hover};

  & img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;
