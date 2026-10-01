import { useNavigate } from 'react-router';

import { styled } from '@mui/material/styles';

import { useSignInReturnPath } from '@web/app/router/useSignInLink';

import { LoginCard } from '../common';

export const PageLoginDesktop = () => {
  const navigate = useNavigate();
  const from = useSignInReturnPath();

  return (
    <PageStyled>
      <FormPanelStyled>
        <LoginCard
          redirectPath={from}
          onVerified={() => navigate(from, { replace: true })}
        />
      </FormPanelStyled>

      <DecorPanelStyled />
    </PageStyled>
  );
};

const PageStyled = styled('div')`
  display: flex;
  width: 100%;
  min-height: 100vh;
`;

const FormPanelStyled = styled('div')`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => theme.palette.background.default};
`;

const DecorPanelStyled = styled('div')`
  flex: 1;
  background: linear-gradient(
    160deg,
    ${({ theme }) => theme.palette.primary.main},
    ${({ theme }) => theme.palette.secondary.main}
  );
`;
