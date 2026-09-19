import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

import { useUser } from '@web/app/providers';

export const SignOutButton = () => {
  const { signOut } = useUser();

  // No navigate() here: dropping the session makes ProtectedRoute redirect,
  // and two navigations would race each other.
  return (
    <ButtonStyled fullWidth size="large" variant="outlined" onClick={signOut}>
      <Trans>Sign out</Trans>
    </ButtonStyled>
  );
};

const ButtonStyled = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;
