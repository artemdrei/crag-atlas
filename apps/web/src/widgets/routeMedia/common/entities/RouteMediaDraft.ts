export type RouteMediaDraft =
  | { kind: 'video'; url: string }
  | { kind: 'photo'; file: File };
