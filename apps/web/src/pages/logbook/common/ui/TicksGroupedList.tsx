import { Plural, Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { GradeBadge } from '@web/shared/ui';

import type { GradeGroup, Tick } from '../entities';
import { TickCard } from './TickCard';
import { TicksSkeleton } from './TicksSkeleton';

export interface Props {
  groups: GradeGroup[];
  ungraded: Tick[];
  isLoading: boolean;
}

export const TicksGroupedList = ({ groups, ungraded, isLoading }: Props) => {
  if (isLoading) return <TicksSkeleton />;

  if (groups.length === 0 && ungraded.length === 0) {
    return (
      <Typography color="text.secondary">
        <Trans>No ascents logged yet.</Trans>
      </Typography>
    );
  }

  return (
    <ListStyled>
      {groups.map(({ grade, sourceGrade, scale, total, ticks }) => (
        <SectionStyled key={grade}>
          <HeaderStyled>
            <GradeBadge grade={sourceGrade} scale={scale} />
            <CountStyled variant="body2" color="text.secondary">
              <Plural
                value={total}
                one="# ascent"
                few="# ascents"
                many="# ascents"
                other="# ascents"
              />
            </CountStyled>
            <RuleStyled />
          </HeaderStyled>
          {ticks.map((tick) => (
            <TickCard key={tick.id} tick={tick} isGradeHidden />
          ))}
        </SectionStyled>
      ))}
      {ungraded.length > 0 && (
        <SectionStyled>
          <HeaderStyled>
            <Typography variant="subtitle2">
              <Trans>Without a grade</Trans>
            </Typography>
            <CountStyled variant="body2" color="text.secondary">
              <Plural
                value={ungraded.length}
                one="# ascent"
                few="# ascents"
                many="# ascents"
                other="# ascents"
              />
            </CountStyled>
            <RuleStyled />
          </HeaderStyled>
          {ungraded.map((tick) => (
            <TickCard key={tick.id} tick={tick} isGradeHidden />
          ))}
        </SectionStyled>
      )}
    </ListStyled>
  );
};

const ListStyled = styled('div')`
  display: flex;
  flex-direction: column;
`;

const SectionStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};

  &:not(:last-of-type) > *:last-child {
    margin-bottom: ${({ theme }) => theme.spacing(4)};
  }
`;

const HeaderStyled = styled('div')`
  position: sticky;
  top: -1px;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(1, 0)};
  background: ${({ theme }) => theme.palette.background.default};
`;

const CountStyled = styled(Typography)`
  flex: 0 0 auto;
  font-weight: 600;
`;

const RuleStyled = styled('span')`
  flex: 1 1 auto;
  height: 1px;
  background: ${({ theme }) => theme.palette.divider};
`;
