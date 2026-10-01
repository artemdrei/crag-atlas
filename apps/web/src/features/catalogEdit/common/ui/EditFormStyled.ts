import { styled } from '@mui/material/styles';

export const EditFormStyled = styled('form')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  max-width: 480px;
`;
