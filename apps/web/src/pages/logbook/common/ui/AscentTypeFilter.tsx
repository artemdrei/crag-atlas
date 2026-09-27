import type { ReactNode } from 'react';

import { Trans } from '@lingui/react/macro';
import ButtonBase from '@mui/material/ButtonBase';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import type { AscentTypeTone } from '@web/shared/theme/palette';
import { ASCENT_TYPES, AscentTypeLabel } from '@web/shared/ui';

import type { AscentFilter } from '../entities';

export interface Props {
  ascentType: AscentFilter;
  counts: Record<AscentFilter, number>;
  onChange: (ascentType: AscentFilter) => void;
}

interface AscentTypeTileProps {
  count: number;
  label: ReactNode;
  tone?: AscentTypeTone;
  isSelected: boolean;
  onSelect: () => void;
}

export const AscentTypeFilter = ({ ascentType, counts, onChange }: Props) => {
  // A style nobody has climbed in this discipline is a tile of zero; only the
  // total is always offered, so the row never reads as empty.
  const styles = ASCENT_TYPES.filter((type) => counts[type]);

  if (styles.length === 0) return null;

  return (
    <RowStyled>
      <AscentTypeTile
        count={counts.all}
        label={<Trans>All</Trans>}
        isSelected={ascentType === 'all'}
        onSelect={() => onChange('all')}
      />
      {styles.map((type) => (
        <AscentTypeTile
          key={type}
          count={counts[type] ?? 0}
          label={<AscentTypeLabel ascentType={type} />}
          tone={type}
          isSelected={ascentType === type}
          onSelect={() => onChange(type)}
        />
      ))}
    </RowStyled>
  );
};

const AscentTypeTile = ({
  count,
  label,
  tone,
  isSelected,
  onSelect
}: AscentTypeTileProps) => (
  <TileStyled isSelected={isSelected} onClick={onSelect}>
    <CountRowStyled>
      {tone && <DotStyled tone={tone} />}
      <Typography variant="h6">{count}</Typography>
    </CountRowStyled>
    <LabelStyled variant="caption" color="text.secondary" noWrap>
      {label}
    </LabelStyled>
  </TileStyled>
);

const RowStyled = styled('div')`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: ${({ theme }) => theme.spacing(0.5)};

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TileStyled = styled(ButtonBase, {
  shouldForwardProp: (prop) => prop !== 'isSelected'
})<{ isSelected: boolean }>`
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(0.25)};
  min-width: ${({ theme }) => theme.spacing(11)};
  padding: ${({ theme }) => theme.spacing(1, 1.5)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 1px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.palette.primary.main : theme.palette.divider};
  background: ${({ theme }) => theme.palette.background.paper};
`;

const CountRowStyled = styled('span')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.75)};
`;

const DotStyled = styled('span', {
  shouldForwardProp: (prop) => prop !== 'tone'
})<{ tone: AscentTypeTone }>`
  width: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(1)};
  border-radius: 50%;
  /* The tone's fill carries the colour on a light ground; in the dark it is
     the muted one of the pair, so the dot takes the bright half instead. */
  background: ${({ theme, tone }) =>
    theme.palette.mode === 'dark'
      ? theme.palette.ascentType[tone].text
      : theme.palette.ascentType[tone].background};
`;

const LabelStyled = styled(Typography)`
  max-width: 100%;
`;
