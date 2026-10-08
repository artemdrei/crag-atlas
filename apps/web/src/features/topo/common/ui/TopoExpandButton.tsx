import { useLingui } from '@lingui/react/macro';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

export interface Props {
  onClick: () => void;
}

export const TopoExpandButton = ({ onClick }: Props) => {
  const { t } = useLingui();

  return (
    <ButtonStyled size="small" aria-label={t`Open the photo`} onClick={onClick}>
      <ZoomInIcon fontSize="small" />
    </ButtonStyled>
  );
};

const ButtonStyled = styled(IconButton)`
  position: absolute;
  right: ${({ theme }) => theme.spacing(1.5)};
  bottom: ${({ theme }) => theme.spacing(1.5)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  background: ${({ theme }) => theme.palette.background.paper};
  color: ${({ theme }) => theme.palette.text.secondary};

  &:hover {
    background: ${({ theme }) => theme.palette.background.paper};
    color: ${({ theme }) => theme.palette.text.primary};
  }
`;
