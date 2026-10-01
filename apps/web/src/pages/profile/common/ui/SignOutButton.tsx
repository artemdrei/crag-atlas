import { Trans } from '@lingui/react/macro';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

import { useUser } from '@web/app/providers';

export const SignOutButton = () => {
  const { signOut } = useUser();

  return (
    <ButtonStyled fullWidth size="large" variant="outlined" onClick={signOut}>
      <Trans>Sign out</Trans>
    </ButtonStyled>
  );
};

const ButtonStyled = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;
