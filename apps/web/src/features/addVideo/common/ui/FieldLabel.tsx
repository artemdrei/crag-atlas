import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const FieldLabel = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
`;
