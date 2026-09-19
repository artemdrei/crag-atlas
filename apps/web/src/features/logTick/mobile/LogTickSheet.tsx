import { Trans, useLingui } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useModal } from '@web/app/providers';
import { toast } from '@web/shared/lib';
import { BottomSheet } from '@web/shared/ui';

import { TickForm, useApiCreateTick } from '../common';

export interface Props {
  open: boolean;
  idRoute: string;
}

const LogTickSheet = ({ open, idRoute }: Props) => {
  const { t } = useLingui();
  const { closeModal } = useModal();

  const close = () => closeModal('LOG_TICK');

  const { isPending, createTick } = useApiCreateTick({
    onCreated: () => {
      toast.success(t`Ascent logged`);
      close();
    }
  });

  return (
    <BottomSheet isOpen={open} onClose={close}>
      <TitleStyled variant="h6">
        <Trans>Log ascent</Trans>
      </TitleStyled>
      <TickForm
        isPending={isPending}
        onSubmit={(payload) => createTick({ ...payload, idRoute })}
        onCancel={close}
      />
    </BottomSheet>
  );
};

const TitleStyled = styled(Typography)`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

export default LogTickSheet;
