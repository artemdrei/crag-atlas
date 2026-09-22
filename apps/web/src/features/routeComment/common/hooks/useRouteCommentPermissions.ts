import { useUser } from '@web/app/providers';

/** The author owns their own comment; an admin may only remove any of them. */
export const useRouteCommentPermissions = (idAuthor: string) => {
  const { idUser, hasRole } = useUser();
  const isMine = !!idUser && idUser === idAuthor;

  return { canEdit: isMine, canDelete: isMine || hasRole('admin') };
};
