import type { ComponentType } from 'react';
import { lazy } from 'react';

export const lazyPage = <Name extends string>(
  load: () => Promise<Record<Name, ComponentType>>,
  name: Name
) => lazy(() => load().then((module) => ({ default: module[name] })));
