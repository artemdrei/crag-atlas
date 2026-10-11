import { useLingui } from '@lingui/react/macro';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { useModal } from '@web/app/providers';
import { BottomSheet } from '@web/shared/ui';

export interface Props {
  open: boolean;
  idRoute: string;
  idMedia: string;
}

const VideoMenuSheet = ({ open, idRoute, idMedia }: Props) => {
  const { t } = useLingui();
  const { openModal, closeModal } = useModal();

  const close = () => closeModal('VIDEO_MENU');

  const handleDelete = () => {
    close();
    openModal('ROUTE_MEDIA_DELETE', { idRoute, idMedia });
  };

  return (
    <BottomSheet isOpen={open} onClose={close}>
      <List>
        <ListItemButton onClick={handleDelete}>
          <ListItemIcon>
            <DeleteOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t`Delete video`} />
        </ListItemButton>
      </List>
    </BottomSheet>
  );
};

export default VideoMenuSheet;
