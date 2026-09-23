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
  onEdit: () => void;
  onDelete: () => void;
}

export const useTickMenuItems = ({
  onEdit,
  onDelete
}: Params): MenuItemSpec[] => {
  const { t } = useLingui();

  return [
    {
      id: 'edit',
      label: t`Edit`,
      icon: <EditOutlinedIcon fontSize="small" />,
      onSelect: onEdit
    },
    {
      id: 'delete',
      label: t`Delete`,
      icon: <DeleteOutlinedIcon fontSize="small" />,
      onSelect: onDelete
    }
  ];
};
