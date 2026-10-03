import { useState } from 'react';

import type { Failure } from '@crag-atlas/utils';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';

import { ApiFeedback } from '@web/shared/ui';

import type { SectorConditions } from '../entities';
import { useSelectedDay } from '../hooks';
import { ConditionsCard } from './ConditionsCard';
import { ConditionsDayStrip } from './ConditionsDayStrip';

const SKELETON_KEYS = Array.from(
  { length: 7 },
  (_, index) => `skeleton-${index}`
);

export interface Props {
  conditions: SectorConditions | null;
  failure: Failure | null;
  isLoading: boolean;
}

// Collapsed, the strip of days is the whole feature: a glance says which day
// to come back on, and the rest is one tap away. The reading is fetched by
// whoever renders it, so the same panel serves a sector and a whole region.
export const ConditionsPanel = ({ conditions, failure, isLoading }: Props) => {
  const [isOpen, setOpen] = useState(false);
  const { day, selectDate } = useSelectedDay(conditions);

  const handleSelect = (date: string) => {
    selectDate(date);
    setOpen(true);
  };

  if (isLoading) {
    return (
      <SkeletonRowStyled>
        {SKELETON_KEYS.map((key) => (
          <SkeletonTileStyled key={key} variant="rounded" />
        ))}
      </SkeletonRowStyled>
    );
  }

  if (!conditions?.hasPoint || !day) return <ApiFeedback failure={failure} />;

  return (
    <>
      <StripRowStyled>
        <ConditionsDayStrip
          date={day.date}
          days={conditions.days}
          onSelect={handleSelect}
        />
        <IconButton size="small" onClick={() => setOpen(!isOpen)}>
          <ChevronStyled isOpen={isOpen} fontSize="small" />
        </IconButton>
      </StripRowStyled>

      <Collapse unmountOnExit in={isOpen}>
        <ConditionsCard conditions={conditions} day={day} />
      </Collapse>
    </>
  );
};

const SkeletonRowStyled = styled('div')`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  overflow: hidden;
  padding-bottom: ${({ theme }) => theme.spacing(0.5)};
`;

const SkeletonTileStyled = styled(Skeleton)`
  flex: 0 0 auto;
  width: 76px;
  height: 70px;
`;

const StripRowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const ChevronStyled = styled(ExpandMoreIcon, {
  shouldForwardProp: (prop) => prop !== 'isOpen'
})<{ isOpen: boolean }>`
  transform: rotate(${({ isOpen }) => (isOpen ? 180 : 0)}deg);
  transition: transform ${({ theme }) => theme.transitions.duration.shortest}ms;
`;
