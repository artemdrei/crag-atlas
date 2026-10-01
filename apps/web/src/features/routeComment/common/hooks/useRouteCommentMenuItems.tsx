import type { ReactNode } from 'react';

import { useLingui } from '@lingui/react/macro';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

export interface MenuItemSpec {
  id: 'edit' | 'delete';
  label: string;
  icon: ReactNode;
  onSelect: () => void;
}

export interface Params {
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const useRouteCommentMenuItems = ({
  canEdit,
  canDelete,
  onEdit,
  onDelete
}: Params): MenuItemSpec[] => {
  const { t } = useLingui();

  return [
    ...(canEdit
      ? [
          {
            id: 'edit' as const,
            label: t`Edit`,
            icon: <EditOutlinedIcon fontSize="small" />,
            onSelect: onEdit
          }
        ]
      : []),
    ...(canDelete
      ? [
          {
            id: 'delete' as const,
            label: t`Delete`,
            icon: <DeleteOutlinedIcon fontSize="small" />,
            onSelect: onDelete
          }
        ]
      : [])
  ];
};
