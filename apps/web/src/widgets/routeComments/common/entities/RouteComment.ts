import type { AscentStyle } from '@web/shared/ui';

export interface RouteComment {
  id: string;
  author: string;
  /** ISO date, e.g. 2026-09-14 */
  postedAt: string;
  text: string;
  ascentStyle?: AscentStyle;
}

/** Demo data until the API serves route comments. */
export const DEMO_ROUTE_COMMENTS: RouteComment[] = [
  {
    id: 'crux',
    author: 'Maria S.',
    postedAt: '2026-09-14',
    ascentStyle: 'redpoint',
    text: 'The crux is far easier off the left-hand crimp — do not reach straight for the far hold. The second bolt clips better from under the roof.'
  },
  {
    id: 'conditions',
    author: 'Oleh K.',
    postedAt: '2026-09-11',
    ascentStyle: 'onsight',
    text: 'Morning shade until eleven, after that the wall bakes and the small holds get greasy.'
  },
  {
    id: 'anchor',
    author: 'Ihor B.',
    postedAt: '2026-09-02',
    text: 'New bolts as of this spring, the anchor has two carabiners.'
  }
];
