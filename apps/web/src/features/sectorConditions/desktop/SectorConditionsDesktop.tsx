import { styled } from '@mui/material/styles';

import type { Coords } from '@web/shared/types';

import { ConditionsSection, useApiGetConditions } from '../common';

export interface Props {
  idSector: string;
  coords?: Coords;
}

export const SectorConditionsDesktop = ({ idSector, coords }: Props) => {
  const { conditions, isLoading, isOffline, failure } = useApiGetConditions({
    idSector,
    coords
  });

  return (
    <SectionStyled
      list="sector"
      conditions={conditions}
      failure={failure}
      isLoading={isLoading}
      isOffline={isOffline}
    />
  );
};

const SectionStyled = styled(ConditionsSection)`
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;
