import { Trans, useLingui } from '@lingui/react/macro';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

import { useModal } from '@web/app/providers';

import {
  ConditionsPanel,
  type ConditionsPlace,
  useApiGetPlaceForecast
} from '../common';

export interface Props {
  open: boolean;
  place: ConditionsPlace;
}

const ConditionsDialogDesktop = ({ open, place }: Props) => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const close = () => closeModal('CONDITIONS');
  const { conditions, isLoading, isOffline, failure } =
    useApiGetPlaceForecast(place);

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={close}>
      <TitleStyled>
        <Trans>Weather</Trans>
        <IconButton aria-label={t`Close`} onClick={close}>
          <CloseIcon />
        </IconButton>
      </TitleStyled>
      <DialogContent>
        <ConditionsPanel
          isOpenByDefault
          list={place.list}
          conditions={conditions}
          failure={failure}
          isLoading={isLoading}
          isOffline={isOffline}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ConditionsDialogDesktop;

const TitleStyled = styled(DialogTitle)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(1)};
`;
