import { useState } from 'react';
import { useNavigate } from 'react-router';

import type { VideoRoute } from '@crag-atlas/api';
import { useLingui } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { buildMediaAddedPath, buildRoutePath } from '@web/app/router/routes';
import { useApiGetVideoPreview } from '@web/shared/api';
import { parseMediaLink, toast } from '@web/shared/lib';

import { useApiCreateVideo } from './useApiCreateVideo';

export const useAddVideoForm = () => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { closeModal } = useModal();
  const [draft, setDraft] = useState('');
  const [url, setUrl] = useState('');
  const [pickedRoute, setPickedRoute] = useState<VideoRoute | null>(null);
  const [isChoosingRoute, setIsChoosingRoute] = useState(false);

  const link = parseMediaLink(url);
  const {
    preview,
    isLoading: isReading,
    failure
  } = useApiGetVideoPreview(link);
  const existing = preview?.existing ?? null;
  const route = pickedRoute ?? preview?.suggestedRoute ?? null;

  const close = () => closeModal('VIDEO_ADD');

  const { isPending, createVideo } = useApiCreateVideo({
    onCreated: (media) => {
      toast.success(t`Video added`);
      close();
      navigate(buildMediaAddedPath(media.id));
    }
  });

  // Committed on paste, blur or Enter, never per keystroke: a half-typed id
  // already parses once it is five characters long.
  const commitLink = (value: string) => {
    setDraft(value);
    setUrl(value.trim());
  };

  const changeDraft = (value: string) => {
    setDraft(value);
    setUrl('');
  };

  const clearLink = () => {
    setDraft('');
    setUrl('');
    setPickedRoute(null);
    setIsChoosingRoute(false);
  };

  const pickRoute = (next: VideoRoute) => {
    setPickedRoute(next);
    setIsChoosingRoute(false);
  };

  const openExisting = () => {
    if (!existing) return;

    const { idRegion, idSector, idRoute } = existing.route;

    close();
    navigate(buildRoutePath(idRegion, idSector, idRoute));
  };

  const submit = () => {
    if (!link || !route) return;

    createVideo({
      idRoute: route.idRoute,
      url: link.url,
      title: preview?.title ?? ''
    });
  };

  return {
    draft,
    preview,
    failure,
    existing,
    route,
    isReading,
    isPending,
    isUnsupported: !!url && !link,
    isSuggested: !pickedRoute && !!preview?.suggestedRoute,
    isChoosingRoute: isChoosingRoute || !route,
    canPickRoute: !!preview && !existing,
    canSubmit: !!preview && !existing && !!route && !isPending,
    changeDraft,
    commitLink,
    pickRoute,
    startChoosingRoute: () => setIsChoosingRoute(true),
    clearLink,
    openExisting,
    submit,
    close
  };
};
