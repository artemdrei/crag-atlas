import { useNavigate } from 'react-router';

import { styled } from '@mui/material/styles';

import { useSignInReturnPath } from '@web/app/router/useSignInLink';

import { LoginCard } from '../common';

export const PageLoginMobile = () => {
  const navigate = useNavigate();
  const from = useSignInReturnPath();

  return (
    <PageStyled>
      <LoginCard
        redirectPath={from}
        onVerified={() => navigate(from, { replace: true })}
      />
    </PageStyled>
  );
};

const PageStyled = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => theme.palette.background.default};
`;
