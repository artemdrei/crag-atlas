import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';

import Tab from '@mui/material/Tab';
import Tabs, { type TabsProps } from '@mui/material/Tabs';

export interface AdminTab {
  path: string;
  label: ReactNode;
}

export interface Props {
  tabs: AdminTab[];
  variant?: TabsProps['variant'];
}

export const AdminTabs = ({ tabs, variant }: Props) => {
  const { pathname } = useLocation();
  const tab = tabs.find(({ path }) => pathname.startsWith(path))?.path ?? false;

  return (
    <Tabs value={tab} variant={variant}>
      {tabs.map(({ path, label }) => (
        <Tab key={path} value={path} label={label} component={Link} to={path} />
      ))}
    </Tabs>
  );
};
