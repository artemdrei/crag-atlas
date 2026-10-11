import { useState } from 'react';

import type { VideoRoute } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { ApiFeedback, BottomSheet, VideoExistsNotice } from '@web/shared/ui';

import {
  ChosenRoute,
  FieldLabel,
  useAddVideoForm,
  VideoLinkField,
  VideoPreviewRow,
  VideoReading
} from '../common';
import { RoutePickerScreen } from './RoutePickerScreen';

export interface Props {
  open: boolean;
}

const AddVideoSheet = ({ open }: Props) => {
  const { t } = useLingui();
  const form = useAddVideoForm();
  const [isPicking, setIsPicking] = useState(false);

  const handlePick = (route: VideoRoute) => {
    form.pickRoute(route);
    setIsPicking(false);
  };

  return (
    <>
      <BottomSheet title={t`Add video`} isOpen={open} onClose={form.close}>
        <BodyStyled>
          {form.preview ? (
            <VideoPreviewRow preview={form.preview} onRemove={form.clearLink} />
          ) : (
            <VideoLinkField
              draft={form.draft}
              hint={t`Supports youtube.com, youtu.be and Shorts`}
              isUnsupported={form.isUnsupported}
              onChange={form.changeDraft}
              onCommit={form.commitLink}
              onClear={form.clearLink}
            />
          )}

          {form.isReading && <VideoReading />}
          <ApiFeedback failure={form.failure} />

          {form.existing && (
            <VideoExistsNotice
              routeName={form.existing.route.name}
              onOpen={form.openExisting}
            />
          )}

          {form.canPickRoute && (
            <SectionStyled>
              <FieldLabel>
                <Trans>Route</Trans>
              </FieldLabel>
              {form.route ? (
                <ChosenRoute
                  route={form.route}
                  isSuggested={form.isSuggested}
                  onChange={() => setIsPicking(true)}
                />
              ) : (
                <PickerButtonStyled onClick={() => setIsPicking(true)}>
                  <SearchIcon fontSize="small" color="action" />
                  <Typography variant="body1" color="text.secondary">
                    <Trans>Choose a route</Trans>
                  </Typography>
                </PickerButtonStyled>
              )}
            </SectionStyled>
          )}

          <Button
            fullWidth
            size="large"
            variant="contained"
            disabled={!form.canSubmit}
            onClick={form.submit}
          >
            {form.isPending ? <Trans>Saving…</Trans> : <Trans>Add</Trans>}
          </Button>
        </BodyStyled>
      </BottomSheet>

      <RoutePickerScreen
        idSelected={form.route?.idRoute}
        isOpen={isPicking}
        onPick={handlePick}
        onClose={() => setIsPicking(false)}
      />
    </>
  );
};

const BodyStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(1)};
`;

const SectionStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const PickerButtonStyled = styled(ButtonBase)`
  justify-content: flex-start;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1.75, 1.5)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

export default AddVideoSheet;
