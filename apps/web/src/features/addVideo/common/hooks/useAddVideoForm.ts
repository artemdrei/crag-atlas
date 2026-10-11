import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { track, type VideoLinkResult } from '@crag-atlas/analytics';
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
  const isSuggested = !pickedRoute && !!preview?.suggestedRoute;

  const close = () => closeModal('VIDEO_ADD');
  const complete = () => closeModal('VIDEO_ADD', { isCompleted: true });

  const checkedUrl = useRef('');

  const linkResult = ((): VideoLinkResult | null => {
    if (!url) return null;
    if (!link) return 'unsupported';
    if (failure) return 'failed';
    if (!preview) return null;

    return existing ? 'duplicate' : 'ok';
  })();

  // A cached preview resolves again on every re-commit of the same link.
  useEffect(() => {
    if (!linkResult || checkedUrl.current === url) return;

    checkedUrl.current = url;

    track({
      name: 'Video Link Checked',
      props: {
        result: linkResult,
        has_suggestion: !!preview?.suggestedRoute
      }
    });
  }, [linkResult, url, preview]);

  const { isPending, createVideo } = useApiCreateVideo({
    onCreated: (media) => {
      toast.success(t`Video added`);
      complete();
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

    complete();
    navigate(buildRoutePath(idRegion, idSector, idRoute));
  };

  const submit = () => {
    if (!link || !route) return;

    createVideo({
      idRoute: route.idRoute,
      url: link.url,
      title: preview?.title ?? '',
      isSuggested
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
    isSuggested,
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
