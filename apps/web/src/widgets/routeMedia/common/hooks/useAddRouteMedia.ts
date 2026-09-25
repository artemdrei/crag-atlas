import { useLingui } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { toast } from '@web/shared/lib';

import { useApiCreateRouteMedia } from './useApiCreateRouteMedia';

export const useAddRouteMedia = (idRoute: string) => {
  const { t } = useLingui();
  const { closeModal } = useModal();

  const close = () => closeModal('ROUTE_MEDIA_ADD');

  const { isPending, createMedia } = useApiCreateRouteMedia({
    idRoute,
    onCreated: () => {
      toast.success(t`Media added`);
      close();
    }
  });

  return { isPending, close, createMedia };
};
