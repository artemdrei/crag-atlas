import { Plural, Trans, useLingui } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface Props {
  grade: string;
  votesSoft: number;
  votesNeutral: number;
  votesHard: number;
  isCompact?: boolean;
  className?: string;
}

export const GradeConsensus = ({
  grade,
  votesSoft,
  votesNeutral,
  votesHard,
  isCompact,
  className
}: Props) => {
  const { t } = useLingui();

  const buckets = [
    { id: 'soft', label: t`soft`, votes: votesSoft },
    { id: 'neutral', label: grade, votes: votesNeutral },
    { id: 'hard', label: t`hard`, votes: votesHard }
  ];
  const total = votesSoft + votesNeutral + votesHard;
  const top = Math.max(...buckets.map(({ votes }) => votes));

  return (
    <CardStyled className={className} isCompact={!!isCompact}>
      <HeaderRowStyled>
        <Typography variant="caption" color="text.secondary">
          <Trans>Grade consensus</Trans>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          <Plural value={total} one="# vote" other="# votes" />
        </Typography>
      </HeaderRowStyled>
      <ChartStyled>
        <BarsRowStyled>
          {buckets.map(({ id, votes }) => (
            <ColumnStyled key={id}>
              <BarStyled
                share={top ? votes / top : 0}
                isConsensus={votes === top}
              >
                <VotesStyled isConsensus={votes === top}>{votes}</VotesStyled>
              </BarStyled>
            </ColumnStyled>
          ))}
        </BarsRowStyled>
        <LabelsRowStyled>
          {buckets.map(({ id, label }) => (
            <ColumnStyled key={id}>
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
            </ColumnStyled>
          ))}
        </LabelsRowStyled>
      </ChartStyled>
    </CardStyled>
  );
};

const CardStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isCompact'
})<{ isCompact: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme, isCompact }) => theme.spacing(isCompact ? 1 : 2)};
  padding: ${({ theme, isCompact }) => theme.spacing(isCompact ? 1.5 : 2)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const HeaderRowStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const ChartStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const BarsRowStyled = styled('div')`
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing(1)};
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

const LabelsRowStyled = styled(BarsRowStyled)`
  border-bottom: none;
`;

const ColumnStyled = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  flex: 1 1 0;
`;

const VotesStyled = styled('span', {
  shouldForwardProp: (prop) => prop !== 'isConsensus'
})<{ isConsensus: boolean }>`
  font-size: ${({ theme }) => theme.typography.h6.fontSize};
  font-weight: 700;
  line-height: 1;
  color: ${({ theme, isConsensus }) =>
    isConsensus
      ? theme.palette.getContrastText(theme.palette.secondary.main)
      : theme.palette.text.primary};
`;

const BarStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'share' && prop !== 'isConsensus'
})<{ share: number; isConsensus: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: ${({ share }) => `${Math.max(share * 72, 32)}px`};
  border-radius: ${({ theme }) =>
    `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`};
  background: ${({ theme, isConsensus }) =>
    isConsensus ? theme.palette.secondary.main : theme.palette.action.selected};
`;
