import { styled } from '@mui/material/styles';

import { ConditionsSection, useApiGetRegionConditions } from '../common';

export interface Props {
  idRegion: string;
}

export const RegionConditionsMobile = ({ idRegion }: Props) => {
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
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(1.5)};
`;
