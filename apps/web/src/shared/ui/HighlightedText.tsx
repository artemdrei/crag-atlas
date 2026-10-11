import { styled } from '@mui/material/styles';

import { matchParts } from '@web/shared/lib';

export interface Props {
  text: string;
  query: string;
}

export const HighlightedText = ({ text, query }: Props) =>
  matchParts(text, query).map(({ text: part, isMatch }, index) =>
    isMatch ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: parts never reorder
      <MarkStyled key={index}>{part}</MarkStyled>
    ) : (
      part
    )
  );

const MarkStyled = styled('mark')`
  padding: 0 1px;
  border-radius: 2px;
  color: ${({ theme }) => theme.palette.primary.contrastText};
  background: ${({ theme }) => theme.palette.primary.main};
`;
