import { Trans } from '@lingui/react/macro';
import ShieldIcon from '@mui/icons-material/Shield';
import { styled } from '@mui/material/styles';

import { useUser } from '@web/app/providers';
import { ApiFeedback, EmptyState, ListSkeleton } from '@web/shared/ui';

import { useApiAdmins, useApiRevokeAdmin } from '../hooks';
import { AdminRow } from './AdminRow';

export const AdminList = () => {
  const { idUser, isLoading: isUserLoading } = useUser();
  const { admins, isLoading, failure } = useApiAdmins();
  const { revokeAdmin, idRevoking } = useApiRevokeAdmin();

  if (isLoading || isUserLoading) return <ListSkeleton variant="row" />;

  if (failure) return <ApiFeedback failure={failure} />;

  if (admins.length === 0) {
    return (
      <EmptyState
        icon={<ShieldIcon />}
        message={<Trans>No admins yet</Trans>}
      />
    );
  }

  return (
    <ListStyled>
      {admins.map((admin) => (
        <AdminRow
          key={admin.idUser}
          admin={admin}
          isMe={admin.idUser === idUser}
          isRevoking={idRevoking === admin.idUser}
          onRevoke={revokeAdmin}
        />
      ))}
    </ListStyled>
  );
};

const ListStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;
