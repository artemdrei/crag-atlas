import { type FormEvent, useState } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useModal } from '@web/app/providers';

import { isQrSlug, qrPrefixOf, qrSlugOf, useApiSetQrSlug } from '../common';

export interface Props {
  idSector: string;
  path: string;
}

export const QrSlugEditor = ({ idSector, path }: Props) => {
  const { t } = useLingui();
  const { openModal } = useModal();
  const { isPending, setQrSlug } = useApiSetQrSlug();
  const prefix = qrPrefixOf(path);
  const initialSlug = qrSlugOf(path);
  const [slug, setSlug] = useState(initialSlug);

  const isChanged = slug !== initialSlug;
  const isValid = isQrSlug(slug);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    openModal('CONFIRM_QR_SLUG', {
      oldPath: path,
      newPath: `${prefix}${slug}`,
      onConfirm: () => setQrSlug({ idSector, slug })
    });
  };

  return (
    <FormStyled onSubmit={handleSubmit}>
      <TextField
        size="small"
        fullWidth
        label={t`QR address`}
        value={slug}
        error={!isValid}
        helperText={
          isValid ? (
            <AddressStyled variant="caption">
              {`/q/${prefix}`.replace(/\//g, '/\u200B')}
              <strong>{slug}</strong>
            </AddressStyled>
          ) : (
            t`Lowercase Latin letters and digits, joined by single hyphens`
          )
        }
        onChange={(event) => setSlug(event.target.value.trim().toLowerCase())}
      />
      {isChanged && (
        <Button
          type="submit"
          variant="outlined"
          disabled={!isValid || isPending}
        >
          <Trans>Change</Trans>
        </Button>
      )}
    </FormStyled>
  );
};

const FormStyled = styled('form')`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const AddressStyled = styled(Typography)`
  color: ${({ theme }) => theme.palette.text.secondary};
`;
