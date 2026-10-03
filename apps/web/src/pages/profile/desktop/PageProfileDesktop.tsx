import { Trans } from '@lingui/react/macro';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useProfileIdentity } from '@web/app/providers';
import { AvatarPickerDesktop } from '@web/features/avatarUpload';
import { OfflineRegionsDesktop } from '@web/features/offlineRegions';

import {
  AccessSetting,
  AppVersion,
  GradeScaleSetting,
  LocaleSetting,
  ProfileIdentity,
  SignOutButton,
  ThemeModeSetting
} from '../common';

export const PageProfileDesktop = () => {
  const { email, name, avatarUrl } = useProfileIdentity();

  return (
    <PageStyled>
      <Typography variant="h4" gutterBottom>
        <Trans>Profile</Trans>
      </Typography>

      <ProfileIdentity
        email={email}
        name={name}
        avatar={
          <AvatarPickerDesktop name={name ?? email} avatarUrl={avatarUrl} />
        }
      />

      <ThemeModeSetting />
      <LocaleSetting />
      <GradeScaleSetting />
      <AccessSetting />
      <OfflineRegionsDesktop />
      <SignOutButton />
      <AppVersion />
    </PageStyled>
  );
};

const PageStyled = styled('div')`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(4)};
`;
