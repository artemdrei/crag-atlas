import { useState } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useModal } from '@web/app/providers';
import { BottomSheet } from '@web/shared/ui';

import { SaveRegionOfflineBody } from '../common';
import { OfflineRegionList } from './OfflineRegionList';

export interface Props {
  open: boolean;
  idRegion?: string;
}

const SaveRegionOfflineSheet = ({ open, idRegion }: Props) => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const [idPicked, setIdPicked] = useState<string>();
  const idSelected = idRegion ?? idPicked;

  const dismiss = () => closeModal('SAVE_REGION_OFFLINE');

  return (
    <BottomSheet title={t`Available offline`} isOpen={open} onClose={dismiss}>
      <ContentStyled>
        {idSelected ? (
          <SaveRegionOfflineBody
            idRegion={idSelected}
            source={idRegion ? 'header' : 'profile'}
            onClose={dismiss}
          />
        ) : (
          <>
            <Typography variant="body2" color="text.secondary">
              <Trans>
                Choose a region to save its sectors, routes and topos for
                offline use.
              </Trans>
            </Typography>
            <OfflineRegionList onSelect={(region) => setIdPicked(region.id)} />
          </>
        )}
      </ContentStyled>
    </BottomSheet>
  );
};

export default SaveRegionOfflineSheet;

const ContentStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;
