import { styled } from '@mui/material/styles';
import type { TypographyProps } from '@mui/material/Typography';
import Typography from '@mui/material/Typography';

import { localNameOf } from '@web/shared/lib';

export interface Props {
  name: string;
  nameLocal?: string | null;
  variant?: TypographyProps['variant'];
  isBlock?: boolean;
}

export const LocalName = ({
  name,
  nameLocal,
  variant = 'subtitle1',
  isBlock
}: Props) => {
  const local = localNameOf(name, nameLocal);

  if (!local) return null;

  // A heading has the width to spell the name out on a line of its own; a
  // card's one line does not, so there it trails the Latin name in brackets.
  if (isBlock) {
    return (
      <BlockStyled variant={variant} color="text.secondary" noWrap>
        {local}
      </BlockStyled>
    );
  }

  return <RootStyled>({local})</RootStyled>;
};

const BlockStyled = styled(Typography)`
  line-height: 1.2;
` as typeof Typography;

// In em, not a spacing step: the gap follows the name it sits beside, from a
// card's caption to a page's heading.
const RootStyled = styled('span')`
  margin-left: 0.35em;
  color: ${({ theme }) => theme.palette.text.secondary};
  font-weight: 400;
`;
