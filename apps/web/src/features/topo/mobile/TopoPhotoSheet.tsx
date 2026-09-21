import type { RouteLine } from '@crag-atlas/api';
import { styled } from '@mui/material/styles';

import { useModal } from '@web/app/providers';
import { BottomSheet } from '@web/shared/ui';

import { TopoPhotoViewer } from '../common';

export interface Props {
  open: boolean;
  photoUrl: string;
  label: string;
  lines: RouteLine[];
  numberOf?: Record<string, number>;
  colorOf?: (idRoute: string) => string | undefined;
}

const TopoPhotoSheet = ({ open, ...photo }: Props) => {
  const { closeModal } = useModal();

  return (
    <BottomSheet isOpen={open} onClose={() => closeModal('VIEW_TOPO_PHOTO')}>
      <BodyStyled>
        <TopoPhotoViewer {...photo} />
      </BodyStyled>
    </BottomSheet>
  );
};

export default TopoPhotoSheet;

const BodyStyled = styled('div')`
  height: 72svh;
  padding: ${({ theme }) => theme.spacing(0, 1, 2)};
`;
