import type { ReactNode } from 'react';

import { styled } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

export interface PillTabOption<T extends string> {
  value: T;
  label: ReactNode;
}

export interface Props<T extends string> {
  value: T;
  options: PillTabOption<T>[];
  isFullWidth?: boolean;
  onChange: (value: T) => void;
}

export const PillTabs = <T extends string>({
  value,
  options,
  isFullWidth,
  onChange
}: Props<T>) => (
  <TabsStyled
    value={value}
    variant={isFullWidth ? 'fullWidth' : 'standard'}
    isFullWidth={!!isFullWidth}
    onChange={(_event, next: T) => onChange(next)}
  >
    {options.map(({ value: option, label }) => (
      <TabStyled key={option} value={option} label={label} disableRipple />
    ))}
  </TabsStyled>
);

const TabsStyled = styled(Tabs, {
  shouldForwardProp: (prop) => prop !== 'isFullWidth'
})<{ isFullWidth: boolean }>`
  align-self: ${({ isFullWidth }) => (isFullWidth ? 'stretch' : 'flex-start')};
  min-height: 0;
  padding: ${({ theme }) => theme.spacing(0.5)};
  background: ${({ theme }) => theme.palette.action.hover};
  border-radius: 999px;

  & .MuiTabs-list {
    gap: ${({ theme }) => theme.spacing(0.5)};
  }

  & .MuiTabs-indicator {
    display: none;
  }
`;

const TabStyled = styled(Tab)`
  min-height: 0;
  padding: ${({ theme }) => theme.spacing(0.75, 2)};
  color: ${({ theme }) => theme.palette.text.secondary};
  border-radius: 999px;

  &.Mui-selected {
    color: ${({ theme }) => theme.palette.primary.contrastText};
    background: ${({ theme }) => theme.palette.primary.main};
  }
`;
