import { styled } from '@mui/material/styles';

import { ConditionsSection, useApiGetRegionConditions } from '../common';

export interface Props {
  idRegion: string;
}

export const RegionConditionsDesktop = ({ idRegion }: Props) => {
  const { conditions, isLoading, failure } =
    useApiGetRegionConditions(idRegion);

  return (
    <SectionStyled
      conditions={conditions}
      failure={failure}
      isLoading={isLoading}
    />
  );
};

const SectionStyled = styled(ConditionsSection)`
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;
