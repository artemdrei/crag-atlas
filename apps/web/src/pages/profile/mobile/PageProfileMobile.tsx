import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useProfileIdentity } from '@web/app/providers';
import { AvatarPickerMobile } from '@web/features/avatarUpload';

import {
  GradeScaleSetting,
  LocaleSetting,
  ProfileIdentity,
  SignOutButton,
  ThemeModeSetting
} from '../common';

export const PageProfileMobile = () => {
  const { email, name, avatarUrl } = useProfileIdentity();

  return (
    <PageStyled>
      <Typography variant="h5" gutterBottom>
        <Trans>Profile</Trans>
      </Typography>

      <ProfileIdentity
        email={email}
        name={name}
        avatar={
          <AvatarPickerMobile name={name ?? email} avatarUrl={avatarUrl} />
        }
      />

      <ThemeModeSetting />
      <LocaleSetting />
      <GradeScaleSetting />
      <SignOutButton />
    </PageStyled>
  );
};

const PageStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(2)};
`;
