import { type FormEvent, useState } from 'react';

import type { GradeScale, UserSummary } from '@crag-atlas/api';
import { Trans, useLingui } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Rating from '@mui/material/Rating';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

import { ClimberPicker } from '@web/features/climberPicker';
import type { AscentType } from '@web/shared/ui';

import type { CreateTick, GradeOpinion, PendingMedia, Tick } from '../entities';
import { AscentTypeChoice } from './AscentTypeChoice';
import { AttemptsStepper } from './AttemptsStepper';
import { GradeFeelChoice } from './GradeFeelChoice';
import { TickFormSection } from './TickFormSection';
import { TickMediaField } from './TickMediaField';

const TYPES_WITH_ATTEMPTS: AscentType[] = ['redpoint', 'toprope', 'attempt'];

export interface Props {
  tick?: Tick;
  routeGrade?: string | null;
  routeGradeScale?: GradeScale | null;
  isPending: boolean;
  onSubmit: (payload: Omit<CreateTick, 'idRoute'>, media: PendingMedia) => void;
  onCancel: () => void;
}

export const TickForm = ({
  tick,
  routeGrade,
  routeGradeScale,
  isPending,
  onSubmit,
  onCancel
}: Props) => {
  const { t } = useLingui();
  const [ascentType, setAscentType] = useState<AscentType>(
    tick?.ascentType ?? 'redpoint'
  );
  const [climbedAt, setClimbedAt] = useState(
    () => tick?.climbedAt ?? todayIso()
  );
  const [attempts, setAttempts] = useState<number | null>(
    tick?.attempts ?? null
  );
  const [partner, setPartner] = useState<UserSummary | null>(
    tick?.idPartner && tick.partnerName
      ? { id: tick.idPartner, displayName: tick.partnerName }
      : null
  );
  const [partnerName, setPartnerName] = useState(
    tick?.idPartner ? '' : (tick?.partnerName ?? '')
  );
  const [rating, setRating] = useState<number | null>(tick?.rating ?? null);
  const grade = routeGrade ?? tick?.routeGrade ?? '';
  const scale = routeGradeScale ?? tick?.routeGradeScale ?? 'french';
  const [gradeVote, setGradeVote] = useState(tick?.gradeVote ?? grade);
  const [gradeFeel, setGradeFeel] = useState<GradeOpinion | null>(
    tick?.gradeOpinion ?? null
  );
  const [note, setNote] = useState(tick?.note ?? '');
  const [notePrivate, setNotePrivate] = useState(tick?.notePrivate ?? false);
  const [media, setMedia] = useState<PendingMedia>({ links: [], files: [] });

  const hasAttempts = TYPES_WITH_ATTEMPTS.includes(ascentType);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    onSubmit(
      {
        ascentType,
        // climbed_at is NOT NULL with a default, so an empty field must drop
        // the key rather than send an empty string.
        ...(climbedAt ? { climbedAt } : {}),
        attempts: hasAttempts ? attempts : null,
        rating,
        gradeVote: gradeVote || null,
        gradeOpinion: gradeFeel,
        idPartner: partner?.id ?? null,
        partnerName: partner ? null : partnerName.trim() || null,
        note: note.trim() || null,
        notePrivate
      },
      media
    );
  };

  return (
    <FormStyled onSubmit={handleSubmit}>
      <TickFormSection isFirst title={<Trans>When did you climb it?</Trans>}>
        <RowStyled>
          <TextField
            fullWidth
            size="small"
            type="date"
            label={t`Date`}
            value={climbedAt}
            slotProps={{ inputLabel: { shrink: true } }}
            onChange={(event) => setClimbedAt(event.target.value)}
          />
          <ClimberPicker
            value={partner}
            label={t`Partner`}
            name={partnerName}
            onChange={setPartner}
            onNameChange={setPartnerName}
          />
        </RowStyled>
      </TickFormSection>

      <TickFormSection title={<Trans>How did you climb it?</Trans>}>
        <TypeRowStyled>
          <AscentTypeChoice value={ascentType} onChange={setAscentType} />
          {hasAttempts && (
            <AttemptsStepper value={attempts} onChange={setAttempts} />
          )}
        </TypeRowStyled>
      </TickFormSection>

      <TickFormSection title={<Trans>How hard is the route?</Trans>}>
        <GradeFeelChoice
          feel={gradeFeel}
          grade={gradeVote}
          scale={scale}
          onFeelChange={setGradeFeel}
          onGradeChange={setGradeVote}
        />
      </TickFormSection>

      <TickFormSection title={<Trans>Did you like it?</Trans>}>
        <Rating
          size="large"
          value={rating}
          getLabelText={(stars) => t`${stars} of 5`}
          onChange={(_event, next) => setRating(next)}
        />
      </TickFormSection>

      <TickFormSection title={<Trans>Share your thoughts</Trans>}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          label={t`Comment`}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        <FormControlLabel
          label={t`Private comment`}
          control={
            <Checkbox
              size="small"
              checked={notePrivate}
              onChange={(event) => setNotePrivate(event.target.checked)}
            />
          }
        />
      </TickFormSection>

      <TickFormSection title={<Trans>Photo and video</Trans>}>
        <TickMediaField
          media={tick?.media}
          pending={media}
          onChange={setMedia}
        />
      </TickFormSection>

      <ActionsStyled>
        <Button type="button" onClick={onCancel}>
          <Trans>Cancel</Trans>
        </Button>
        <Button type="submit" variant="contained" disabled={isPending}>
          {isPending ? (
            <Trans>Saving…</Trans>
          ) : tick ? (
            <Trans>Save</Trans>
          ) : (
            <Trans>Log ascent</Trans>
          )}
        </Button>
      </ActionsStyled>
    </FormStyled>
  );
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const FormStyled = styled('form')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2.5)};
  padding-top: ${({ theme }) => theme.spacing(1)};
`;

const TypeRowStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const RowStyled = styled('div')`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing(2)};
  align-items: start;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const ActionsStyled = styled('div')`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(1)};
`;
