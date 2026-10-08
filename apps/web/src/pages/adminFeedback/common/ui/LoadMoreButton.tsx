import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

export interface Props {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export const LoadMoreButton = ({ hasMore, isLoading, onLoadMore }: Props) => {
  if (!hasMore) return null;

  return (
    <FooterStyled>
      <Button color="inherit" disabled={isLoading} onClick={onLoadMore}>
        {isLoading ? <Trans>Loading…</Trans> : <Trans>Load more</Trans>}
      </Button>
    </FooterStyled>
  );
};

const FooterStyled = styled('div')`
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(1, 0)};
`;
