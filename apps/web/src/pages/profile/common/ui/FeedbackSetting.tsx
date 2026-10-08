import { Trans } from '@lingui/react/macro';

import { FeedbackButton } from '@web/features/feedback';

import { ProfileSettingRow } from './ProfileSettingRow';

export const FeedbackSetting = () => (
  <ProfileSettingRow label={<Trans>Feedback</Trans>}>
    <FeedbackButton />
  </ProfileSettingRow>
);
