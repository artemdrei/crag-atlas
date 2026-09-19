import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useModal } from '@web/app/providers';
import { BottomSheet } from '@web/shared/ui';

export interface Props {
  open: boolean;
  title: string;
}

const PlaygroundDemoSheet = ({ open, title }: Props) => {
  const { closeModal } = useModal();
  const close = () => closeModal('PLAYGROUND_DEMO');

  return (
    <BottomSheet isOpen={open} onClose={close}>
      <Typography variant="h6">{title}</Typography>
      <BodyStyled variant="body2">
        Registered through ModalProvider, opened by id — the same path every
        real modal takes.
      </BodyStyled>
      <Button fullWidth variant="outlined" onClick={close}>
        close
      </Button>
    </BottomSheet>
  );
};

const BodyStyled = styled(Typography)`
  margin: ${({ theme }) => theme.spacing(1, 0, 2)};
`;

export default PlaygroundDemoSheet;
