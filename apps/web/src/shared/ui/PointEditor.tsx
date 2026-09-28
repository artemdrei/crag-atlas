import { useEffect, useState } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { formatCoords, parseCoords } from '@web/shared/lib';
import type { Coords } from '@web/shared/types';

export interface Props {
  point?: Coords;
  onChange: (point?: Coords) => void;
}

export const PointEditor = ({ point, onChange }: Props) => {
  const { t } = useLingui();
  const [draft, setDraft] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);

  useEffect(() => {
    setDraft(point ? formatCoords(point) : '');
    setIsInvalid(false);
  }, [point]);

  const apply = (value: string) => {
    setDraft(value);

    if (!value.trim()) {
      setIsInvalid(false);

      return;
    }

    const parsed = parseCoords(value);

    setIsInvalid(!parsed);

    if (parsed) onChange(parsed);
  };

  return (
    <EditorStyled>
      <Typography variant="caption" color="text.secondary">
        <Trans>Click the map, or paste coordinates from Google Maps.</Trans>
      </Typography>
      <RowStyled>
        <TextField
          required
          size="small"
          value={draft}
          error={isInvalid}
          label={t`Coordinates`}
          placeholder="48.68291, 26.56402"
          helperText={
            isInvalid ? (
              <Trans>
                Unreadable. A short maps.app.goo.gl link carries no coordinates
                — use "Copy coordinates" instead.
              </Trans>
            ) : undefined
          }
          onChange={(event) => apply(event.target.value)}
        />
        {point && (
          <ClearButtonStyled
            type="button"
            size="small"
            onClick={() => onChange(undefined)}
          >
            <Trans>Clear</Trans>
          </ClearButtonStyled>
        )}
      </RowStyled>
    </EditorStyled>
  );
};

const EditorStyled = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const RowStyled = styled('div')`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const ClearButtonStyled = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;
