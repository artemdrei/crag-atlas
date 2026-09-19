import { styled } from '@mui/material/styles';

/** Shared by the three edit forms so they read the same on every page. */
export const EditFormStyled = styled('form')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  max-width: 480px;
`;
