import { Trans } from '@lingui/react/macro';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { PillTabs } from '@web/shared/ui';

export const LOGBOOK_TABS = ['mine', 'feed'] as const;

export type LogbookTab = (typeof LOGBOOK_TABS)[number];

export interface Props {
  tab: LogbookTab;
  isPill?: boolean;
  onChange: (tab: LogbookTab) => void;
}

export const LogbookTabs = ({ tab, isPill, onChange }: Props) =>
  isPill ? (
    <PillTabs
      value={tab}
      options={[
        { value: 'mine', label: <Trans>My ascents</Trans> },
        { value: 'feed', label: <Trans>Community feed</Trans> }
      ]}
      onChange={onChange}
    />
  ) : (
    <Tabs
      value={tab}
      variant="scrollable"
      scrollButtons={false}
      onChange={(_event, next: LogbookTab) => onChange(next)}
    >
      <Tab value="mine" label={<Trans>My ascents</Trans>} />
      <Tab value="feed" label={<Trans>Community feed</Trans>} />
    </Tabs>
  );
