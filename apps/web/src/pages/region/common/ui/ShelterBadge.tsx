import type { Shelter } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import UmbrellaIcon from '@mui/icons-material/Umbrella';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';

export interface Props {
  shelter: Exclude<Shelter, 'open'>;
}

export const ShelterBadge = ({ shelter }: Props) => {
  const { t } = useLingui();

  const isFull = shelter === 'full';
  const label = isFull
    ? t`Fully sheltered: a roof or overhang keeps it dry`
    : t`Partly sheltered: some routes stay dry`;
  const Icon = isFull ? BeachAccessIcon : TiltedUmbrellaStyled;

  return (
    <Tooltip title={label}>
      <Icon fontSize="small" aria-label={label} />
    </Tooltip>
  );
};

const TiltedUmbrellaStyled = styled(UmbrellaIcon)`
  transform: rotate(-45deg);
`;
