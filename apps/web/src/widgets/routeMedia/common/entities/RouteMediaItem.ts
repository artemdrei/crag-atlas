export interface RouteMediaItem {
  id: string;
  title: string;
  author: string;
  /** Videos carry a duration, photos do not. */
  duration?: string;
}

/** Demo data until the API serves route media. */
export const DEMO_ROUTE_MEDIA: RouteMediaItem[] = [
  { id: 'beta', title: 'Crux beta', author: 'Oleh K.', duration: '0:48' },
  { id: 'send', title: 'Full ascent', author: 'Maria S.', duration: '2:10' },
  { id: 'anchor', title: 'Anchor close-up', author: 'Ihor B.' }
];
