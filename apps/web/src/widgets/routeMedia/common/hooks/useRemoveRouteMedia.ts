import { useLingui } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { toast } from '@web/shared/lib';

import { useApiDeleteRouteMedia } from './useApiDeleteRouteMedia';

export interface Params {
  idRoute: string;
  idMedia: string;
}

export const useRemoveRouteMedia = ({ idRoute, idMedia }: Params) => {
  const { t } = useLingui();
  const { closeModal } = useModal();

  const close = () => closeModal('ROUTE_MEDIA_DELETE');

  const { isPending, deleteMedia } = useApiDeleteRouteMedia({
    idRoute,
    idMedia,
    onDeleted: () => {
      toast.success(t`Media deleted`);
      close();
    }
  });

  return { isPending, close, deleteMedia };
};
