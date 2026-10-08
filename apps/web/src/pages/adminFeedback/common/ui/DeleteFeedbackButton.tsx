import type { Feedback } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

import { useModal } from '@web/app/providers';

export interface Props {
  entry: Feedback;
  className?: string;
}

export const DeleteFeedbackButton = ({ entry, className }: Props) => {
  const { t } = useLingui();
  const { openModal } = useModal();

  return (
    <IconButtonStyled
      size="small"
      className={className}
      aria-label={t`Delete feedback`}
      onClick={() =>
        openModal('DELETE_FEEDBACK', {
          idFeedback: entry.id,
          rating: entry.rating,
          message: entry.message,
          authorName: entry.authorName
        })
      }
    >
      <DeleteOutlinedIcon fontSize="small" />
    </IconButtonStyled>
  );
};

const IconButtonStyled = styled(IconButton)`
  &:hover {
    color: ${({ theme }) => theme.palette.error.main};
  }
`;
