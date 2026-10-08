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
import { coordsOf, useWeatherFailureMessage } from '@web/shared/lib';
import type { AscentType, Coords } from '@web/shared/types';

import type { CreateTick, GradeOpinion, PendingMedia, Tick } from '../entities';
import { useRouteSends, useTickConditions } from '../hooks';
import { AscentTypeChoice } from './AscentTypeChoice';
import { AttemptsStepper } from './AttemptsStepper';
import { ConditionsSection } from './ConditionsSection';
import { GradeFeelChoice } from './GradeFeelChoice';
import { RepeatAscentNotice } from './RepeatAscentNotice';
import { TickFormSection } from './TickFormSection';
import { TickMediaField } from './tickMediaField';

const TYPES_WITH_ATTEMPTS: AscentType[] = ['redpoint', 'toprope', 'attempt'];

export interface Props {
  tick?: Tick;
  idRoute: string;
  coords?: Coords;
  routeGrade?: string | null;
  routeGradeScale?: GradeScale | null;
  isPending: boolean;
  onSubmit: (payload: Omit<CreateTick, 'idRoute'>, media: PendingMedia) => void;
  onCancel: () => void;
}

export const TickForm = ({
  tick,
  idRoute,
  coords,
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
    () => tick?.climbedAt ?? nowLocal().date
  );
  const [climbedAtTime, setClimbedAtTime] = useState(() =>
    tick ? (tick.climbedAtTime ?? '') : nowLocal().time
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

  const { firstSend, sendCount } = useRouteSends(idRoute);
  const isRepeat = !tick && !!firstSend;
  const isFirstAscentLocked = !!firstSend && firstSend.id !== tick?.id;
  const hasAttempts = TYPES_WITH_ATTEMPTS.includes(ascentType);
  const describeWeatherFailure = useWeatherFailureMessage();
  const {
    conditions,
    weather,
    failure,
    hasPoint,
    isLoading,
    isOffline,
    isEditsReset,
    isEdited,
    setField,
    resetField
  } = useTickConditions({
    coords: coords ?? coordsOf({ lat: tick?.sectorLat, lng: tick?.sectorLng }),
    climbedAt,
    climbedAtTime,
    stored: tick?.weather
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    onSubmit(
      {
        ascentType,
        // climbed_at is NOT NULL with a default, so an empty field drops the
        // key rather than sending an empty string.
        ...(climbedAt ? { climbedAt } : {}),
        climbedAtTime: climbedAtTime || null,
        weather,
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
      {!tick && firstSend && (
        <RepeatAscentNotice firstSend={firstSend} sendCount={sendCount} />
      )}

      <ConditionsSection
        climbedAt={climbedAt}
        climbedAtTime={climbedAtTime}
        conditions={conditions}
        failureMessage={
          failure &&
          describeWeatherFailure('code' in failure ? failure.code : null)
        }
        hasPoint={hasPoint}
        isLoading={isLoading}
        isOffline={isOffline}
        isEditsReset={isEditsReset}
        isEdited={isEdited}
        onDateChange={setClimbedAt}
        onTimeChange={setClimbedAtTime}
        onFieldChange={setField}
        onFieldReset={resetField}
      />

      <TickFormSection title={<Trans>How did you climb it?</Trans>}>
        <TypeRowStyled>
          <AscentTypeChoice
            value={ascentType}
            isFirstAscentLocked={isFirstAscentLocked}
            onChange={setAscentType}
          />
          {hasAttempts && (
            <AttemptsStepper value={attempts} onChange={setAttempts} />
          )}
        </TypeRowStyled>
        <ClimberPicker
          value={partner}
          label={t`Partner`}
          name={partnerName}
          onChange={setPartner}
          onNameChange={setPartnerName}
        />
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
        <Button
          type="submit"
          variant="contained"
          color={isRepeat ? 'success' : 'primary'}
          disabled={isPending}
        >
          {isPending ? (
            <Trans>Saving…</Trans>
          ) : tick ? (
            <Trans>Save</Trans>
          ) : isRepeat ? (
            <Trans>Log repeat</Trans>
          ) : (
            <Trans>Log ascent</Trans>
          )}
        </Button>
      </ActionsStyled>
    </FormStyled>
  );
};

// Local, not UTC: an evening ascent would otherwise be logged for tomorrow.
const nowLocal = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');

  return {
    date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`
  };
};

const FormStyled = styled('form')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2.5)};
  padding-top: ${({ theme }) => theme.spacing(1)};
`;

const TypeRowStyled = styled('div')`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(1.5)};
`;

const ActionsStyled = styled('div')`
  position: sticky;
  z-index: 1;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1.5, 0, 2.5)};
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-top: 1px solid ${({ theme }) => theme.palette.divider};
`;
