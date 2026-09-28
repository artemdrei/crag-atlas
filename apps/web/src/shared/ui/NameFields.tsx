import { Trans, useLingui } from '@lingui/react/macro';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import {
  isFollowingLatin,
  isNameLatin,
  toLatin,
  useTransliteration
} from '@web/shared/lib';

import { ChangedTextField } from './ChangedTextField';

export interface Props {
  name: string;
  nameLocal: string;
  isCompact?: boolean;
  isNameChanged?: boolean;
  isNameLocalChanged?: boolean;
  onNameChange: (name: string) => void;
  onNameLocalChange: (nameLocal: string) => void;
}

export const NameFields = ({
  name,
  nameLocal,
  isCompact,
  isNameChanged,
  isNameLocalChanged,
  onNameChange,
  onNameLocalChange
}: Props) => {
  const { t } = useLingui();
  const isReady = useTransliteration();
  const size = isCompact ? 'small' : 'medium';

  const isValid = isNameLatin(name);
  const hasLocal = !!nameLocal.trim();
  const auto = isReady && hasLocal ? toLatin(nameLocal) : undefined;
  const canAutoCorrect = auto !== undefined && auto !== name;

  // Nothing can be said about the pair before the charmap lands, and the
  // wrong line for a frame is worse than no line.
  const latinHelperText = () => {
    if (!isValid) return t`Latin letters only`;

    const isFollowing = hasLocal
      ? isFollowingLatin(name, nameLocal)
      : undefined;

    if (isFollowing === undefined) return undefined;

    return isFollowing
      ? t`Written for you from the name above`
      : t`Your own spelling — the name above no longer changes it`;
  };

  return (
    <GroupStyled>
      <Typography variant="caption" color="text.secondary">
        <Trans>
          Write it in your own language — it will be searchable both in Latin
          and in yours
        </Trans>
      </Typography>
      <ChangedTextField
        fullWidth
        required
        size={size}
        label={t`Name`}
        value={nameLocal}
        isChanged={isNameLocalChanged}
        onChange={(event) => onNameLocalChange(event.target.value)}
      />
      <ChangedTextField
        fullWidth
        required
        size={size}
        label={t`Latin name`}
        value={name}
        isChanged={isNameChanged}
        error={!isValid}
        helperText={latinHelperText()}
        slotProps={{
          input: {
            endAdornment: canAutoCorrect ? (
              <InputAdornment position="end">
                <Button
                  type="button"
                  size="small"
                  startIcon={<AutoFixHighIcon fontSize="small" />}
                  onClick={() => onNameChange(auto)}
                >
                  <Trans>Auto</Trans>
                </Button>
              </InputAdornment>
            ) : undefined
          }
        }}
        onChange={(event) => onNameChange(event.target.value)}
      />
    </GroupStyled>
  );
};

const GroupStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(1.5)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
`;
