import type { ClimberContent } from '@crag-atlas/api';

export const isErasable = (content: ClimberContent | null) =>
  !!content && content.ascents + content.comments + content.media === 0;
