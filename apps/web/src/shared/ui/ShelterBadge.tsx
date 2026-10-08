import type { Shelter } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import UmbrellaIcon from '@mui/icons-material/Umbrella';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

export interface Props {
  shelter: Shelter;
}

const useShelterLabel = (shelter: Shelter): string | null => {
  const { t } = useLingui();

  if (shelter === 'open') return null;

  return shelter === 'full'
    ? t`You can climb here in the rain`
    : t`Some routes stay dry in the rain`;
};

export const ShelterBadge = ({ shelter }: Props) => {
  const label = useShelterLabel(shelter);

  if (!label) return null;

  const Icon = shelter === 'full' ? BeachAccessIcon : TiltedUmbrellaStyled;

  return (
    <Tooltip title={label}>
      <Icon fontSize="small" aria-label={label} />
    </Tooltip>
  );
};

export const ShelterNote = ({ shelter }: Props) => {
  const label = useShelterLabel(shelter);

  return label ? (
    <Typography variant="caption" color="text.secondary">
      ({label})
    </Typography>
  ) : null;
};

const TiltedUmbrellaStyled = styled(UmbrellaIcon)`
  transform: rotate(-45deg);
`;
