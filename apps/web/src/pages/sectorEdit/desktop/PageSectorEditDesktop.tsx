import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Plural, Trans, useLingui } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { buildSectorPath } from '@web/app/router/routes';
import {
  hasUnsavedChanges,
  TopoEditorDesktop,
  useTopoEditorActions,
  useTopoEditorSession
} from '@web/features/topoEditor';
import { useWarnOnUnload } from '@web/shared/lib';
import { ApiFeedback, EditorPageShell } from '@web/shared/ui';

import { useSectorEditorData } from '../common';

export const PageSectorEditDesktop = () => {
  const { t } = useLingui();
  const { idRegion = '', idSector = '' } = useParams();
  const navigate = useNavigate();
  const { openModal } = useModal();
  const { sector, routes, topos, isLoading, failure } =
    useSectorEditorData(idSector);
  const editor = useTopoEditorSession();
  const actions = useTopoEditorActions({ idSector, editor, topos, routes });
  const { session, dispatch } = editor;

  const isDirty = hasUnsavedChanges(session);

  const leave = () => {
    const go = () => navigate(buildSectorPath(idRegion, idSector));

    if (!isDirty) {
      go();

      return;
    }

    openModal('LEAVE_EDITOR', { onConfirm: go });
  };

  // An empty sector is legitimate, so emptiness cannot mean "not hydrated".
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (isLoading || hasHydrated.current) return;

    hasHydrated.current = true;
    dispatch({ type: 'SESSION_HYDRATED', topos, routes });
  }, [isLoading, topos, routes, dispatch]);

  useEffect(() => {
    if (isLoading || !hasHydrated.current) return;

    dispatch({ type: 'TOPOS_REPLACED', topos });
  }, [isLoading, topos, dispatch]);

  useWarnOnUnload(isDirty);

  return (
    <EditorPageShell
      backLabel={t`Back to the sector`}
      title={
        <>
          {sector?.name ?? '…'} ·{' '}
          <Plural
            value={routes.length}
            one="# route"
            few="# routes"
            many="# routes"
            other="# routes"
          />
        </>
      }
      onLeave={leave}
    >
      <ApiFeedback
        isLoading={isLoading}
        failure={failure}
        loadingLabel={<Trans>Loading the sector…</Trans>}
      />
      {!isLoading && !failure && (
        <TopoEditorDesktop
          sector={sector ?? undefined}
          savedRoutes={routes}
          editor={editor}
          actions={actions}
        />
      )}
    </EditorPageShell>
  );
};
