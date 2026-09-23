import { Trans } from '@lingui/react/macro';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

export const LOGBOOK_TABS = ['mine', 'feed'] as const;

export type LogbookTab = (typeof LOGBOOK_TABS)[number];

export interface Props {
  tab: LogbookTab;
  onChange: (tab: LogbookTab) => void;
}

export const LogbookTabs = ({ tab, onChange }: Props) => (
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
