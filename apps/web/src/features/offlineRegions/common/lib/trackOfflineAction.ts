import type { AnalyticsEvent } from '@crag-atlas/analytics';
import { track } from '@crag-atlas/analytics';

type Props = Extract<
  AnalyticsEvent,
  { name: 'Offline Region Action' }
>['props'];

export const trackOfflineAction = (props: Props) =>
  track({ name: 'Offline Region Action', props });
