import type { AnalyticsEvent } from '@crag-atlas/analytics';
import { track } from '@crag-atlas/analytics';

type Props = Extract<AnalyticsEvent, { name: 'List Controls Used' }>['props'];

export const trackListControl = (
  list: Props['list'],
  control: Props['control'],
  value: string
) => track({ name: 'List Controls Used', props: { list, control, value } });
