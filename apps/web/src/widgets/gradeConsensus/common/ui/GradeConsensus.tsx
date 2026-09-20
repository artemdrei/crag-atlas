import { Plural, Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import type { GradeVote } from '../entities';

export interface Props {
  votes: GradeVote[];
}

export const GradeConsensus = ({ votes }: Props) => {
  const total = votes.reduce((sum, { votes: count }) => sum + count, 0);
  const top = Math.max(...votes.map(({ votes: count }) => count));

  return (
    <CardStyled>
      <HeaderRowStyled>
        <TitleStyled variant="overline" color="text.secondary">
          <Trans>Grade consensus</Trans>
        </TitleStyled>
        <Typography variant="caption" color="text.secondary">
          <Plural value={total} one="# vote" other="# votes" />
        </Typography>
      </HeaderRowStyled>
      <BarsRowStyled>
        {votes.map(({ grade, votes: count }) => (
          <ColumnStyled key={grade}>
            <BarStyled
              share={count / top}
              isConsensus={count === top}
              aria-hidden
            />
            <Typography variant="caption" color="text.secondary">
              {grade}
            </Typography>
          </ColumnStyled>
        ))}
      </BarsRowStyled>
    </CardStyled>
  );
};

const CardStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const TitleStyled = styled(Typography)`
  letter-spacing: 0.08em;
`;

const BarsRowStyled = styled('div')`
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const ColumnStyled = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(0.5)};
  flex: 1 1 0;
`;

const BarStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'share' && prop !== 'isConsensus'
})<{ share: number; isConsensus: boolean }>`
  width: ${({ share }) => `${Math.max(share, 0.15) * 100}%`};
  height: 10px;
  border-radius: 5px;
  background: ${({ theme, isConsensus }) =>
    isConsensus ? theme.palette.secondary.main : theme.palette.action.selected};
`;
