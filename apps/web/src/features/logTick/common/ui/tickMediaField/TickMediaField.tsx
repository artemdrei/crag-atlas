import { useId, useState } from 'react';

import type { TickMedia } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { parseMediaLink } from '@web/shared/lib';

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

  const savedVideos = media.filter((item) => item.kind === 'video');

  const addLink = (value: string): boolean => {
    const link = parseMediaLink(value);

    if (!link) return false;

    setDraft('');
    setIsInvalid(false);

    if (!pending.links.includes(link.url)) {
      onChange({ ...pending, links: [...pending.links, link.url] });
    }

    return true;
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
