import { useNavigate } from 'react-router';

import type { Video } from '@crag-atlas/api';

import { useModal, useUser } from '@web/app/providers';
import { useSignInLink } from '@web/app/router/useSignInLink';

export const useVideoActions = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const { idUser, isAuthenticated, hasRole } = useUser();
  const signInLink = useSignInLink();

  const isOwn = (video: Video) => !!idUser && video.idUser === idUser;
  const mediaOf = (video: Video) => ({
    idRoute: video.route.idRoute,
    idMedia: video.id
  });

  return {
    isOwn,
    canDelete: (video: Video) => isOwn(video) || hasRole('admin'),
    addVideo: () => {
      if (isAuthenticated) {
        openModal('VIDEO_ADD');
        return;
      }

      navigate(signInLink.to, { state: { from: signInLink.from } });
    },
    playVideo: (video: Video) => openModal('ROUTE_MEDIA_VIEW', mediaOf(video)),
    openVideoMenu: (video: Video) => openModal('VIDEO_MENU', mediaOf(video)),
    deleteVideo: (video: Video) =>
      openModal('ROUTE_MEDIA_DELETE', mediaOf(video))
  };
};
