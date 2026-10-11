export const VIDEO_SORTS = ['newest', 'oldest'] as const;

export type VideoSort = (typeof VIDEO_SORTS)[number];

export interface VideoFilters {
  query: string;
  gradeFrom: string;
  gradeTo: string;
  sort: VideoSort;
}

export const VIDEO_FILTER_PARAMS = {
  query: 'q',
  gradeFrom: 'from',
  gradeTo: 'to',
  sort: 'sort',
  added: 'added'
} as const;
