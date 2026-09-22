import { useLingui } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { toast } from '@web/shared/lib';

import { useApiDeleteRouteComment } from './useApiDeleteRouteComment';

export interface Params {
  idRoute: string;
  idComment: string;
}

export const useRemoveRouteComment = ({ idRoute, idComment }: Params) => {
  const { t } = useLingui();
  const { closeModal } = useModal();

  const close = () => closeModal('ROUTE_COMMENT_DELETE');

  const { isPending, deleteComment } = useApiDeleteRouteComment({
    idRoute,
    idComment,
    onDeleted: () => {
      toast.success(t`Comment deleted`);
      close();
    }
  });

  return { isPending, close, deleteComment };
};
