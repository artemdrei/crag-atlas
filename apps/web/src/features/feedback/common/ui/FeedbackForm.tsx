import { type FormEvent, useState } from 'react';

import { TEXT_LIMITS } from '@crag-atlas/utils';
import { Trans, useLingui } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { toast } from '@web/shared/lib';
import { FormActions, LimitedTextField } from '@web/shared/ui';

import type { FeedbackDraft } from '../entities';

const PRAISE_FROM = 4;

export interface Props {
  isGuest: boolean;
  isPending: boolean;
  onSubmit: (draft: FeedbackDraft) => void;
  onCancel: () => void;
}

export const FeedbackForm = ({
  isGuest,
  isPending,
  onSubmit,
  onCancel
}: Props) => {
  const { t } = useLingui();
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!rating) return;

    if (website) {
      setWebsite('');
      toast.error(t`Something went wrong, please try sending again`);

      return;
    }

    onSubmit({ rating, message, email });
  };

  const messageLabel =
    rating !== null && rating < PRAISE_FROM
      ? t`What could be better?`
      : t`Share your impressions and ideas`;

  return (
    <FormStyled onSubmit={handleSubmit}>
      <Typography variant="body2" color="text.secondary">
        <Trans>
          Your feedback truly matters to us. We read every message and build
          Crag Atlas together with climbers, so it becomes your best partner at
          the crag.
        </Trans>
      </Typography>
      <RatingStyled>
        <Typography variant="body1">
          <Trans>How do you find Crag Atlas?</Trans>
        </Typography>
        <Rating
          size="large"
          value={rating}
          getLabelText={(stars) => t`${stars} of 5`}
          onChange={(_event, next) => setRating(next)}
        />
      </RatingStyled>
      <LimitedTextField
        fullWidth
        multiline
        minRows={3}
        maxLength={TEXT_LIMITS.feedbackMessage}
        label={messageLabel}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      {isGuest && message.trim() && (
        <TextField
          fullWidth
          type="email"
          label={t`Email, if you want a reply`}
          value={email}
          slotProps={{ htmlInput: { maxLength: TEXT_LIMITS.email } }}
          onChange={(event) => setEmail(event.target.value)}
        />
      )}
      <HoneypotStyled
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        label="Website"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
      />
      <FormActions>
        <Button type="button" onClick={onCancel}>
          <Trans>Cancel</Trans>
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isPending || !rating}
        >
          {isPending ? <Trans>Sending…</Trans> : <Trans>Send</Trans>}
        </Button>
      </FormActions>
    </FormStyled>
  );
};

const FormStyled = styled('form')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(1)};
`;

const RatingStyled = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const HoneypotStyled = styled(TextField)`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;
