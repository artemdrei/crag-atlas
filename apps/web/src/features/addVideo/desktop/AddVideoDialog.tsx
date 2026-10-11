import { useState } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

import { ApiFeedback, VideoExistsNotice } from '@web/shared/ui';

import {
  ChosenRoute,
  FieldLabel,
  RouteOptionList,
  useAddVideoForm,
  useApiSearchRoutes,
  VideoLinkField,
  VideoPreviewRow,
  VideoReading
} from '../common';

export interface Props {
  open: boolean;
}

const AddVideoDialog = ({ open }: Props) => {
  const { t } = useLingui();
  const form = useAddVideoForm();
  const [query, setQuery] = useState('');
  const { routes, isLoading, term } = useApiSearchRoutes(query);

  const handlePick: typeof form.pickRoute = (route) => {
    form.pickRoute(route);
    setQuery('');
  };

  return (
    <DialogStyled fullWidth open={open} onClose={form.close}>
      <DialogTitle>
        <Trans>Add video</Trans>
      </DialogTitle>
      <CloseButtonStyled aria-label={t`Close`} onClick={form.close}>
        <CloseIcon fontSize="small" />
      </CloseButtonStyled>

      <ContentStyled>
        {form.preview ? (
          <VideoPreviewRow preview={form.preview} onRemove={form.clearLink} />
        ) : (
          <SectionStyled>
            <FieldLabel>
              <Trans>Link</Trans>
            </FieldLabel>
            <VideoLinkField
              draft={form.draft}
              isUnsupported={form.isUnsupported}
              onChange={form.changeDraft}
              onCommit={form.commitLink}
              onClear={form.clearLink}
            />
          </SectionStyled>
        )}

        {form.isReading && <VideoReading />}
        <ApiFeedback failure={form.failure} />

        {form.existing ? (
          <VideoExistsNotice
            routeName={form.existing.route.name}
            onOpen={form.openExisting}
          />
        ) : (
          <SectionStyled>
            <FieldLabel>
              <Trans>Route</Trans>
            </FieldLabel>
            {form.route && !form.isChoosingRoute ? (
              <ChosenRoute
                route={form.route}
                isSuggested={form.isSuggested}
                onChange={form.startChoosingRoute}
              />
            ) : (
              <>
                <TextField
                  fullWidth
                  autoFocus={form.canPickRoute}
                  value={query}
                  disabled={!form.canPickRoute}
                  placeholder={
                    form.canPickRoute
                      ? t`Search for a route`
                      : t`Paste a link first`
                  }
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      )
                    }
                  }}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <RouteOptionList
                  routes={routes}
                  idSelected={form.route?.idRoute}
                  hasTerm={!!term}
                  isLoading={isLoading}
                  onPick={handlePick}
                />
              </>
            )}
          </SectionStyled>
        )}
      </ContentStyled>

      <DialogActions>
        <Button onClick={form.close}>
          <Trans>Cancel</Trans>
        </Button>
        <Button
          variant="contained"
          disabled={!form.canSubmit}
          onClick={form.submit}
        >
          {form.isPending ? <Trans>Saving…</Trans> : <Trans>Add</Trans>}
        </Button>
      </DialogActions>
    </DialogStyled>
  );
};

const DialogStyled = styled(Dialog)`
  .MuiDialog-paper {
    max-width: 480px;
  }
`;

const CloseButtonStyled = styled(IconButton)`
  position: absolute;
  top: ${({ theme }) => theme.spacing(1)};
  right: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const ContentStyled = styled(DialogContent)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  min-height: 240px;
`;

const SectionStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export default AddVideoDialog;
