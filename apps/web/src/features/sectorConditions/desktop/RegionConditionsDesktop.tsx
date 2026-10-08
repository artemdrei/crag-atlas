import { styled } from '@mui/material/styles';

import type { Coords } from '@web/shared/types';

import { ConditionsSection, useApiGetRegionConditions } from '../common';

export interface Props {
  idRegion: string;
  coords?: Coords;
}

export const RegionConditionsDesktop = ({ idRegion, coords }: Props) => {
  const { conditions, isLoading, isOffline, failure } =
    useApiGetRegionConditions({
      idRegion,
      coords
    });

  return (
    <SectionStyled
      list="region"
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
