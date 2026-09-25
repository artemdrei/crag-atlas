import { useUser } from '@web/app/providers';

/** The uploader owns their own media; an admin may remove any of it. */
export const useRouteMediaPermissions = () => {
  const { idUser, hasRole } = useUser();

  return {
    canDelete: (idAuthor: string) =>
      (!!idUser && idUser === idAuthor) || hasRole('admin')
  };
};
