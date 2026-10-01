import { useUser } from '@web/app/providers';

export const useRouteCommentPermissions = (idAuthor: string) => {
  const { idUser, hasRole } = useUser();
  const isMine = !!idUser && idUser === idAuthor;

  return { canEdit: isMine, canDelete: isMine || hasRole('admin') };
};
