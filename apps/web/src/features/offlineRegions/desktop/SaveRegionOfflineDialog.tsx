import { Trans } from '@lingui/react/macro';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { styled } from '@mui/material/styles';

import { useModal } from '@web/app/providers';

import {
  OfflineRegionPicker,
  SaveRegionOfflineBody,
  useOfflineRegionChoice
} from '../common';

export interface Props {
  open: boolean;
}

const SaveRegionOfflineDialog = ({ open }: Props) => {
  const { closeModal } = useModal();
  const choice = useOfflineRegionChoice();

  const dismiss = () => {
    choice.select(null);
    closeModal('SAVE_REGION_OFFLINE');
  };

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={dismiss}>
      <DialogTitle>
        <Trans>Available offline</Trans>
      </DialogTitle>
      <ContentStyled>
        {choice.isPickable && (
          <OfflineRegionPicker
            options={choice.options}
            value={choice.selected}
            isLoading={choice.isLoading}
            isDisabled={false}
            onChange={choice.select}
          />
        )}
        {choice.selected && (
          <SaveRegionOfflineBody
            key={choice.selected.id}
            idRegion={choice.selected.id}
            source="profile"
            onClose={dismiss}
          />
        )}
      </ContentStyled>
    </Dialog>
  );
};

export default SaveRegionOfflineDialog;

// MUI drops the content's top padding after a title, which clips the
// picker's floating label.
const ContentStyled = styled(DialogContent)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};

  && {
    padding-top: ${({ theme }) => theme.spacing(1)};
  }
`;
