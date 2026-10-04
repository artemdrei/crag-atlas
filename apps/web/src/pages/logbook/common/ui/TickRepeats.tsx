import { useState } from 'react';

import { Plural, Trans, useLingui } from '@lingui/react/macro';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import {
  TickActionsButton,
  toRouteSends,
  useApiGetMyRouteTicks
} from '@web/features/logTick';
import { AscentTypeBadge } from '@web/shared/ui';

import type { Tick } from '../entities';
import { formatClimbedAt } from '../lib';
import { TickConditions } from './TickConditions';
import { TicksSkeleton } from './TicksSkeleton';

export interface Props {
  idRoute: string;
  repeatCount: number;
}

export const TickRepeats = ({ idRoute, repeatCount }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { ticks, isLoading } = useApiGetMyRouteTicks(idRoute, isExpanded);
  const { repeats } = toRouteSends(ticks);

  return (
    <RepeatsStyled>
      <ToggleStyled
        size="small"
        color="success"
        aria-expanded={isExpanded}
        endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        onClick={() => setIsExpanded((value) => !value)}
      >
        <Plural
          value={repeatCount}
          one="# repeat"
          few="# repeats"
          many="# repeats"
          other="# repeats"
        />
      </ToggleStyled>

      {isExpanded &&
        (isLoading ? (
          <TicksSkeleton count={repeatCount} />
        ) : (
          <ListStyled>
            {repeats.map((tick) => (
              <RepeatRow key={tick.id} tick={tick} />
            ))}
          </ListStyled>
        ))}
    </RepeatsStyled>
  );
};

const RepeatRow = ({ tick }: { tick: Tick }) => {
  const { i18n } = useLingui();

  return (
    <RowStyled>
      <RowHeaderStyled>
        <SummaryStyled>
          <Typography variant="body2">
            {formatClimbedAt(tick, i18n.locale)}
          </Typography>
          <AscentTypeBadge
            ascentType={tick.ascentType}
            attempts={tick.attempts}
          />
          {!!tick.rating && (
            <Rating value={tick.rating} precision={0.5} size="small" readOnly />
          )}
        </SummaryStyled>
        <TickActionsButton tick={tick} />
      </RowHeaderStyled>
      {tick.weather && <TickConditions weather={tick.weather} />}
      {tick.note && (
        <Typography variant="body2" color="text.secondary">
          {tick.note}
        </Typography>
      )}
      {tick.partnerName && (
        <Typography variant="body2" color="text.secondary">
          <Trans>Belayer</Trans>: {tick.partnerName}
        </Typography>
      )}
    </RowStyled>
  );
};

const RepeatsStyled = styled('div')`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const ToggleStyled = styled(Button)`
  align-self: flex-start;
  font-weight: 600;
`;

const ListStyled = styled('ol')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  margin: 0;
  padding: 0;
  list-style: none;
`;

const RowStyled = styled('li')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.75)};
  padding: ${({ theme }) => theme.spacing(1, 1.5)};
  border-left: 3px solid ${({ theme }) => theme.palette.success.main};
  background: ${({ theme }) => theme.palette.action.hover};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

const RowHeaderStyled = styled('div')`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const SummaryStyled = styled('div')`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;
