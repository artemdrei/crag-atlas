import { useModal } from '@web/app/providers';

export interface Params {
  idRoute: string;
  idComment: string;
  body: string;
}

/** What the ⋮ menu does on either device: hand off to the edit or delete surface. */
export const useRouteCommentMenu = ({ idRoute, idComment, body }: Params) => {
  const { openModal, closeModal } = useModal();

  const close = () => closeModal('ROUTE_COMMENT_MENU');

  const handOff = (idModal: 'ROUTE_COMMENT_EDIT' | 'ROUTE_COMMENT_DELETE') => {
    if (idModal === 'ROUTE_COMMENT_EDIT') {
      openModal('ROUTE_COMMENT_EDIT', { idRoute, idComment, body });
    } else {
      openModal('ROUTE_COMMENT_DELETE', { idRoute, idComment });
    }

    close();
  };

  return {
    close,
    edit: () => handOff('ROUTE_COMMENT_EDIT'),
    remove: () => handOff('ROUTE_COMMENT_DELETE')
  };
};
