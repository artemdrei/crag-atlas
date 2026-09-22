import { type FormEvent, useState } from 'react';

import { Trans, useLingui } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

import { FormActions } from '@web/shared/ui';

export interface Props {
  submitLabel: string;
  initialBody?: string;
  isPending: boolean;
  onSubmit: (body: string) => void;
  onCancel?: () => void;
}

export const RouteCommentForm = ({
  submitLabel,
  initialBody = '',
  isPending,
  onSubmit,
  onCancel
}: Props) => {
  const { t } = useLingui();
  const [body, setBody] = useState(initialBody);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(body.trim());
  };

  return (
    <FormStyled onSubmit={handleSubmit}>
      <TextField
        fullWidth
        multiline
        minRows={2}
        label={t`Your beta`}
        value={body}
        onChange={(event) => setBody(event.target.value)}
      />
      <FormActions>
        {onCancel && (
          <Button type="button" onClick={onCancel}>
            <Trans>Cancel</Trans>
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={isPending || !body.trim()}
        >
          {isPending ? <Trans>Saving…</Trans> : submitLabel}
        </Button>
      </FormActions>
    </FormStyled>
  );
};

const FormStyled = styled('form')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;
