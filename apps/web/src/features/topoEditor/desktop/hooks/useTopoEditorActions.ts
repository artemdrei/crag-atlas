import { useCallback } from 'react';

import type { SaveRouteLine, Topo } from '@crag-atlas/api';
import { resolveFailureMessage, toFailure } from '@crag-atlas/utils';
import { useLingui } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { toast } from '@web/shared/lib';

import type {
  EditableLine,
  TopoEditorSession,
  TopoEditorSessionApi
} from '../../common';
import {
  anchorOf,
  boltsOf,
  useApiCreateRoute,
  useApiDeleteRoute,
  useApiDeleteRouteLine,
  useApiDeleteTopo,
  useApiReorderTopos,
  useApiSaveRouteLine,
  useApiUpdateRoute
} from '../../common';

export interface Params {
  idSector: string;
  editor: TopoEditorSessionApi;
  topos: Topo[];
}

export const useTopoEditorActions = ({ idSector, editor, topos }: Params) => {
  const { t } = useLingui();
  const { openModal } = useModal();
  const { session, dispatch, resetHistory } = editor;

  const { isPending: isSavingFields, updateRoute } = useApiUpdateRoute();
  const { isPending: isSavingLine, saveRouteLine } = useApiSaveRouteLine({
    idSector
  });
  const { deleteRouteLine } = useApiDeleteRouteLine({ idSector });
  const { isPending: isCreatingRoute, createRoute } = useApiCreateRoute({
    idSector
  });
  const { deleteRoute } = useApiDeleteRoute({ idSector });
  const { deleteTopo } = useApiDeleteTopo({ idSector });
  const { reorderTopos } = useApiReorderTopos({ idSector });

  const saveRoute = useCallback(
    async (idRoute: string) => {
      const draft = session.routes[idRoute];

      if (!draft) return;

      const fields = {
        name: draft.name.trim(),
        grade: draft.grade,
        gradeScale: draft.gradeScale,
        type: draft.type,
        length: toNumber(draft.length),
        boltsCount: toNumber(draft.boltsCount),
        description: draft.description
      };

      try {
        let idSaved = idRoute;

        if (draft.isNew) {
          const route = await createRoute(fields);

          idSaved = route.id;
          dispatch({ type: 'ROUTE_CREATED', idDraft: idRoute, route });
          resetHistory();
        } else {
          await updateRoute({ idRoute, payload: fields });
        }

        for (const topo of Object.values(session.topos)) {
          const line = topo.lines[idRoute];

          if (!line?.isDirty) continue;

          await saveRouteLine({
            idRoute: idSaved,
            idTopo: topo.id,
            payload: toLinePayload(line)
          });
        }

        dispatch({ type: 'ROUTE_SAVED', idRoute: idSaved });
      } catch (error) {
        toast.error(resolveFailureMessage(toFailure(error)));
      }
    },
    [session, dispatch, resetHistory, createRoute, updateRoute, saveRouteLine]
  );

  const removeLine = useCallback(async () => {
    const { idSelectedRoute, idActiveTopo } = session;

    if (!idSelectedRoute || !idActiveTopo) return;

    const hasSavedLine = !!topos
      .find(({ id }) => id === idActiveTopo)
      ?.lines.some((line) => line.idRoute === idSelectedRoute);

    try {
      if (hasSavedLine) {
        await deleteRouteLine({
          idRoute: idSelectedRoute,
          idTopo: idActiveTopo
        });
      }

      dispatch({ type: 'DELETE_LINE' });
      resetHistory();
    } catch (error) {
      toast.error(resolveFailureMessage(toFailure(error)));
    }
  }, [session, topos, deleteRouteLine, dispatch, resetHistory]);

  const addRoute = useCallback(
    () => dispatch({ type: 'ADD_ROUTE', idDraft: crypto.randomUUID() }),
    [dispatch]
  );

  const removeRoute = useCallback(
    async (idRoute: string) => {
      if (session.routes[idRoute]?.isNew) {
        dispatch({ type: 'REMOVE_ROUTE', idRoute });

        return;
      }

      try {
        await deleteRoute(idRoute);
        dispatch({ type: 'REMOVE_ROUTE', idRoute });
        resetHistory();
      } catch (error) {
        toast.error(resolveFailureMessage(toFailure(error)));
      }
    },
    [session.routes, deleteRoute, dispatch, resetHistory]
  );

  const addPhoto = useCallback(
    (files: File[]) => openModal('UPLOAD_TOPO_PHOTO', { idSector, files }),
    [openModal, idSector]
  );

  const replacePhoto = useCallback(
    (idTopo: string, file: File) => {
      const current = session.topos[idTopo];

      if (!current) return;

      openModal('UPLOAD_TOPO_PHOTO', {
        idSector,
        files: [file],
        replacing: {
          idTopo,
          photoUrl: current.photoUrl,
          ratio:
            current.width && current.height
              ? current.width / current.height
              : 0,
          hasLines: Object.keys(current.lines).length > 0
        }
      });
    },
    [openModal, idSector, session.topos]
  );

  const removePhoto = useCallback(
    async (idTopo: string) => {
      const current = session.topos[idTopo];
      const affected = Object.keys(current?.lines ?? {})
        .map((idRoute) => session.routes[idRoute]?.name)
        .filter(Boolean);

      if (
        affected.length > 0 &&
        !window.confirm(
          t`This photo carries the lines of: ${affected.join(', ')}. Delete it anyway?`
        )
      ) {
        return;
      }

      try {
        await deleteTopo({ idTopo, isForced: affected.length > 0 });
        resetHistory();
      } catch (error) {
        toast.error(resolveFailureMessage(toFailure(error)));
      }
    },
    [session.topos, session.routes, deleteTopo, resetHistory, t]
  );

  const movePhotoTo = useCallback(
    async (idTopo: string, to: number) => {
      const previous = session.order;
      const order = [...previous];
      const from = order.indexOf(idTopo);

      if (from === -1 || to < 0 || to >= order.length || from === to) return;

      order.splice(to, 0, ...order.splice(from, 1));
      dispatch({ type: 'REORDER_TOPOS', order });

      try {
        await reorderTopos({
          items: order.map((id, sortOrder) => ({ idTopo: id, sortOrder }))
        });
      } catch (error) {
        // The strip already moved, so a failed save has to move it back.
        dispatch({ type: 'REORDER_TOPOS', order: previous });
        toast.error(resolveFailureMessage(toFailure(error)));
      }
    },
    [session.order, dispatch, reorderTopos]
  );

  return {
    isBusy: isSavingFields || isSavingLine || isCreatingRoute,
    saveRoute,
    removeLine,
    addRoute,
    removeRoute,
    addPhoto,
    replacePhoto,
    removePhoto,
    movePhotoTo
  };
};

const toLinePayload = (line: EditableLine): SaveRouteLine => ({
  points: line.points,
  bolts: boltsOf(line.points, line.kinds),
  anchor: anchorOf(line.points, line.kinds),
  labelOffsetX: line.labelOffset[0],
  labelOffsetY: line.labelOffset[1]
});

const toNumber = (value: string): number | null => {
  const parsed = Number(value.trim());

  return value.trim() === '' || Number.isNaN(parsed) ? null : parsed;
};

export type TopoEditorActions = ReturnType<typeof useTopoEditorActions>;

export type { TopoEditorSession };
