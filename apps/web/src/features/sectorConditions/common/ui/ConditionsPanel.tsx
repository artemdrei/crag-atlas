import { useState } from 'react';

import type { Failure } from '@crag-atlas/utils';
import { Trans } from '@lingui/react/macro';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { trackListControl } from '@web/shared/lib';
import { ApiFeedback } from '@web/shared/ui';

import type { SectorConditions } from '../entities';
import { useSelectedDay } from '../hooks';
import { ConditionsCard } from './ConditionsCard';
import {
  ConditionsDayStrip,
  ConditionsDayStripSkeleton
} from './ConditionsDayStrip';

export interface Props {
  list: 'sector' | 'region';
  conditions: SectorConditions | null;
  failure: Failure | null;
  isLoading: boolean;
  isOffline: boolean;
  isOpenByDefault?: boolean;
}

// Collapsed, the strip of days is the whole feature: a glance says which day
// to come back on, and the rest is one tap away. The reading is fetched by
// whoever renders it, so the same panel serves a sector and a whole region.
export const ConditionsPanel = ({
  list,
  conditions,
  failure,
  isLoading,
  isOffline,
  isOpenByDefault = false
}: Props) => {
  const [isOpen, setOpen] = useState(isOpenByDefault);
  const { day, selectDate } = useSelectedDay(conditions);

  const handleSelect = (date: string) => {
    const offset = conditions?.days.findIndex((one) => one.date === date) ?? -1;

    trackListControl(list, 'conditions_day', String(offset));
    selectDate(date);
    setOpen(true);
  };

  const toggleOpen = () => {
    trackListControl(list, 'conditions_expand', isOpen ? 'closed' : 'open');
    setOpen(!isOpen);
  };

  if (isOffline) {
    return (
      <Typography variant="body2" color="text.secondary">
        <Trans>No weather while you are offline</Trans>
      </Typography>
    );
  }

  if (isLoading) {
    return (
      <StripRowStyled>
        <ConditionsDayStripSkeleton />
        <IconButton disabled size="small">
          <ChevronStyled isOpen={false} fontSize="small" />
        </IconButton>
      </StripRowStyled>
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
        <IconButton size="small" onClick={toggleOpen}>
          <ChevronStyled isOpen={isOpen} fontSize="small" />
        </IconButton>
      </StripRowStyled>

      <Collapse unmountOnExit in={isOpen}>
        <ConditionsCard conditions={conditions} day={day} />
      </Collapse>
    </>
  );
};

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
