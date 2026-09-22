import { useLingui } from '@lingui/react/macro';

import { useModal } from '@web/app/providers';
import { toast } from '@web/shared/lib';

import { useApiUpdateRouteComment } from './useApiUpdateRouteComment';

export interface Params {
  idRoute: string;
  idComment: string;
}

export const useEditRouteComment = ({ idRoute, idComment }: Params) => {
  const { t } = useLingui();
  const { closeModal } = useModal();

  const close = () => closeModal('ROUTE_COMMENT_EDIT');

  const { isPending, updateComment } = useApiUpdateRouteComment({
    idRoute,
    idComment,
    onUpdated: () => {
      toast.success(t`Comment saved`);
      close();
    }
  });

  return {
    isPending,
    close,
    saveComment: (body: string) => updateComment({ body })
  };
};
