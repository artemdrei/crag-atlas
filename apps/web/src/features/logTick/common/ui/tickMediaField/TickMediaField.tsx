import { useId, useRef, useState } from 'react';

import type { TickMedia } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useFetchVideoPreview } from '@web/shared/api';
import { type MediaLink, parseMediaLink } from '@web/shared/lib';
import { VideoExistsNotice } from '@web/shared/ui';

import type { PendingMedia } from '../../entities';
import { MediaThumb } from './MediaThumb';

export interface Props {
  media?: TickMedia[];
  pending: PendingMedia;
  onChange: (pending: PendingMedia) => void;
}

export const TickMediaField = ({ media = [], pending, onChange }: Props) => {
  const { t } = useLingui();
  const idLink = useId();
  const [draft, setDraft] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);
  const [duplicateRoute, setDuplicateRoute] = useState<string | null>(null);
  const fetchVideoPreview = useFetchVideoPreview();
  // The duplicate check answers after the climber may have changed the list.
  const pendingRef = useRef(pending);

  pendingRef.current = pending;

  const savedVideos = media.filter((item) => item.kind === 'video');

  const addLink = (value: string): boolean => {
    const link = parseMediaLink(value);

    if (!link) return false;

    setDraft('');
    setIsInvalid(false);
    setDuplicateRoute(null);

    const isAttached = pending.links.some(
      (url) => parseMediaLink(url)?.id === link.id
    );

    if (!isAttached) {
      onChange({ ...pending, links: [...pending.links, link.url] });
      void dropIfKnown(link);
    }

    return true;
  };

  // Attached first and taken back if the catalog already has it, so a save
  // right after Enter keeps the link. An unreachable check lets it through:
  // the server refuses a duplicate anyway.
  const dropIfKnown = async (link: MediaLink) => {
    const preview = await fetchVideoPreview(link).catch(() => null);

    if (!preview?.existing) return;

    const current = pendingRef.current;

    setDuplicateRoute(preview.existing.route.name);
    onChange({
      ...current,
      links: current.links.filter((url) => url !== link.url)
    });
  };

  // Typed links are committed on blur, Enter or the add button, never per
  // keystroke: a half-typed id already parses once it is five characters long.
  const commitDraft = () => {
    if (draft.trim() && !addLink(draft)) setIsInvalid(true);
  };

  return (
    <FieldStyled>
      <GroupStyled>
        <Typography component="label" variant="subtitle2" htmlFor={idLink}>
          <Trans>YouTube link</Trans>
        </Typography>
        <TextField
          fullWidth
          size="small"
          id={idLink}
          value={draft}
          error={isInvalid}
          placeholder="https://"
          helperText={
            isInvalid ? <Trans>This is not a YouTube link.</Trans> : undefined
          }
          slotProps={{
            input: {
              endAdornment: draft ? (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    size="small"
                    aria-label={t`Add the link`}
                    onClick={commitDraft}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined
            }
          }}
          onChange={(event) => {
            setDraft(event.target.value);
            setIsInvalid(false);
            setDuplicateRoute(null);
          }}
          onPaste={(event) => {
            if (addLink(event.clipboardData.getData('text'))) {
              event.preventDefault();
            }
          }}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;

            event.preventDefault();
            commitDraft();
          }}
        />
        {duplicateRoute && <VideoExistsNotice routeName={duplicateRoute} />}
        {(savedVideos.length > 0 || pending.links.length > 0) && (
          <GridStyled>
            {savedVideos.map((item) => (
              <MediaThumb key={item.id} label={item.url} videoUrl={item.url} />
            ))}
            {pending.links.map((url) => (
              <MediaThumb
                key={url}
                label={url}
                videoUrl={url}
                onRemove={() =>
                  onChange({
                    ...pending,
                    links: pending.links.filter((link) => link !== url)
                  })
                }
              />
            ))}
          </GridStyled>
        )}
      </GroupStyled>
    </FieldStyled>
  );
};

const FieldStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2.5)};
  width: 100%;
`;

const GroupStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const GridStyled = styled('div')`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;
