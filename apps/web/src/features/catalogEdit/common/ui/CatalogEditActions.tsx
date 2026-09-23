import { Trans } from '@lingui/react/macro';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

import { ArchivedToggle } from '@web/shared/ui';

import { EditToggleButton } from './EditToggleButton';

export interface Props {
  isEditing: boolean;
  isArchiveShown: boolean;
  canEdit?: boolean;
  onEdit: () => void;
  onClose: () => void;
  onToggleArchive: () => void;
}

export const CatalogEditActions = ({
  isEditing,
  isArchiveShown,
  canEdit = true,
  onEdit,
  onClose,
  onToggleArchive
}: Props) => (
  <ActionsStyled>
    {isEditing && (
      <ArchivedToggle isOn={isArchiveShown} onToggle={onToggleArchive} />
    )}
    {isEditing ? (
      <Button
        size="small"
        variant="outlined"
        startIcon={<CloseIcon fontSize="small" />}
        onClick={onClose}
      >
        <Trans>Close editing</Trans>
      </Button>
    ) : (
      canEdit && <EditToggleButton onClick={onEdit} />
    )}
  </ActionsStyled>
);

const ActionsStyled = styled('div')`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;
