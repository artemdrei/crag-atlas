import type { AdminCandidate } from '@crag-atlas/api';
import type { Failure } from '@crag-atlas/utils';
import { Trans } from '@lingui/react/macro';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { MIN_SEARCH_LENGTH } from '@web/shared/api';
import { ApiFeedback, EmptyState, UserAvatar } from '@web/shared/ui';

import { useApiAdminCandidates } from '../hooks';

const AVATAR_SIZE = 36;
const SLOT_HEIGHT = 280;

export interface Props {
  query: string;
  selected: string[];
  onToggle: (idUser: string) => void;
}

export const AdminCandidateList = ({ query, selected, onToggle }: Props) => {
  const { candidates, isLoading, failure, term } = useApiAdminCandidates(query);

  // Every state fills the same slot: the dialog must not resize while typing.
  return (
    <SlotStyled>
      <Candidates
        candidates={candidates}
        isLoading={isLoading}
        failure={failure}
        term={term}
        selected={selected}
        onToggle={onToggle}
      />
    </SlotStyled>
  );
};

interface CandidatesProps extends Pick<Props, 'selected' | 'onToggle'> {
  candidates: AdminCandidate[];
  isLoading: boolean;
  failure: Failure | null;
  term: string;
}

const Candidates = ({
  candidates,
  isLoading,
  failure,
  term,
  selected,
  onToggle
}: CandidatesProps) => {
  if (failure) return <ApiFeedback failure={failure} />;

  if (term.length < MIN_SEARCH_LENGTH) {
    return (
      <EmptyState
        icon={<PersonSearchIcon />}
        message={
          <Trans>Type at least {MIN_SEARCH_LENGTH} letters of a name</Trans>
        }
      />
    );
  }

  if (isLoading) return <CircularProgress size={24} />;

  if (candidates.length === 0) {
    return (
      <EmptyState
        icon={<SearchOffIcon />}
        message={<Trans>Nobody found</Trans>}
      />
    );
  }

  return (
    <ListStyled disablePadding>
      {candidates.map((candidate) => (
        <ListItemButton
          key={candidate.idUser}
          disabled={candidate.isAdmin}
          selected={selected.includes(candidate.idUser)}
          onClick={() => onToggle(candidate.idUser)}
        >
          <UserAvatar
            name={candidate.displayName}
            avatarUrl={candidate.avatarUrl ?? undefined}
            size={AVATAR_SIZE}
          />
          <TextStyled
            primary={candidate.displayName}
            secondary={candidate.email}
          />
          {candidate.isAdmin ? (
            <Typography variant="body2" color="text.secondary">
              <Trans>already an admin</Trans>
            </Typography>
          ) : (
            selected.includes(candidate.idUser) && (
              <CheckCircleIcon color="primary" />
            )
          )}
        </ListItemButton>
      ))}
    </ListStyled>
  );
};

const SlotStyled = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: ${SLOT_HEIGHT}px;
`;

const ListStyled = styled(List)`
  flex: 1;
  align-self: stretch;
  overflow-y: auto;
`;

const TextStyled = styled(ListItemText)`
  margin-left: ${({ theme }) => theme.spacing(1.5)};
  min-width: 0;
`;
