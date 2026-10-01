import { useUser } from '@web/app/providers';

export const useRouteMediaPermissions = () => {
  const { idUser, hasRole } = useUser();

  return {
    canDelete: (idAuthor: string) =>
      (!!idUser && idUser === idAuthor) || hasRole('admin')
  };
};
