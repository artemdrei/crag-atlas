import { useLingui } from '@lingui/react/macro';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import IconButton from '@mui/material/IconButton';
import { alpha, styled } from '@mui/material/styles';

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
  background: ${({ theme }) => theme.palette.text.primary};
  color: ${({ theme }) => theme.palette.background.paper};
  box-shadow: ${({ theme }) => theme.shadows[4]};

  &:hover {
    background: ${({ theme }) => alpha(theme.palette.text.primary, 0.85)};
  }
`;
