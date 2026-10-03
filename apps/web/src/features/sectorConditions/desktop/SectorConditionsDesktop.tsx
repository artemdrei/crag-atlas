import { styled } from '@mui/material/styles';

import { ConditionsSection, useApiGetConditions } from '../common';

export interface Props {
  idSector: string;
}

export const SectorConditionsDesktop = ({ idSector }: Props) => {
  const { conditions, isLoading, failure } = useApiGetConditions(idSector);

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
