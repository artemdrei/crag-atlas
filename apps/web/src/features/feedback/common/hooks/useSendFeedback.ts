import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';

import { track } from '@crag-atlas/analytics';
import { useLingui } from '@lingui/react/macro';

import { useModal, useUser } from '@web/app/providers';
import { isStandalone, toast, useIsOnline } from '@web/shared/lib';

import type { FeedbackDraft } from '../entities';
import { useApiCreateFeedback } from './useApiCreateFeedback';

const CLOSE_AFTER_SENT_MS = 1500;

const platformOf = (): string =>
  `${isMobile ? 'mobile' : 'desktop'}${isStandalone() ? '-pwa' : ''}`;

export const useSendFeedback = () => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const { isAuthenticated } = useUser();
  const isOnline = useIsOnline();
  const [isSent, setIsSent] = useState(false);

  const dismiss = () => closeModal('SEND_FEEDBACK');

  const { isPending, createFeedback } = useApiCreateFeedback({
    onSent: (payload) => {
      track({
        name: 'Feedback Sent',
        props: { rating: payload.rating, has_message: !!payload.message }
      });
      setIsSent(true);
    }
  });

  useEffect(() => {
    if (!isSent) return;

    const timer = window.setTimeout(
      () => closeModal('SEND_FEEDBACK', { isCompleted: true }),
      CLOSE_AFTER_SENT_MS
    );

    return () => window.clearTimeout(timer);
  }, [isSent, closeModal]);

  const send = (draft: FeedbackDraft) => {
    if (!isOnline) {
      toast.error(
        t`No internet connection. Send your feedback again once you are back online`
      );

      return;
    }

    const message = draft.message.trim() || null;

    createFeedback({
      rating: draft.rating,
      message,
      email: isAuthenticated || !message ? null : draft.email.trim() || null,
      url: window.location.pathname,
      appVersion: __APP_VERSION__,
      platform: platformOf()
    });
  };

  return { isPending, isSent, isGuest: !isAuthenticated, dismiss, send };
};
