import { Trans, useLingui } from '@lingui/react/macro';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

export interface Props {
  draft: string;
  hint?: string;
  isUnsupported: boolean;
  onChange: (draft: string) => void;
  onCommit: (url: string) => void;
  onClear: () => void;
}

export const VideoLinkField = ({
  draft,
  hint,
  isUnsupported,
  onChange,
  onCommit,
  onClear
}: Props) => {
  const { t } = useLingui();

  const handlePasteButton = async () => {
    const text = await navigator.clipboard.readText().catch(() => '');

    if (text) onCommit(text);
  };

  return (
    <TextField
      fullWidth
      autoFocus
      value={draft}
      error={isUnsupported}
      placeholder={t`YouTube link`}
      helperText={
        isUnsupported ? <Trans>Only YouTube links for now</Trans> : hint
      }
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              {draft ? (
                <IconButton
                  edge="end"
                  size="small"
                  aria-label={t`Clear`}
                  onClick={onClear}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              ) : (
                <Button
                  size="small"
                  variant="contained"
                  onClick={handlePasteButton}
                >
                  <Trans>Paste</Trans>
                </Button>
              )}
            </InputAdornment>
          )
        }
      }}
      onChange={(event) => onChange(event.target.value)}
      onPaste={(event) => {
        event.preventDefault();
        onCommit(event.clipboardData.getData('text'));
      }}
      onBlur={() => draft.trim() && onCommit(draft)}
      onKeyDown={(event) => {
        if (event.key !== 'Enter') return;

        event.preventDefault();
        onCommit(draft);
      }}
    />
  );
};
