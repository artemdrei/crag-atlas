import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

export const DangerButton = styled(Button)`
  opacity: 0.5;
  transition: opacity 0.15s ease-out;

  &:hover {
    opacity: 1;
  }

  &:disabled {
    opacity: 0.25;
  }
`;
