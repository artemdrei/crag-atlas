import type { GradeScale, SearchHit, VideoRoute } from '@crag-atlas/api';

export const routeOfHit = (hit: SearchHit): VideoRoute => ({
  idRoute: hit.idRoute ?? hit.id,
  idSector: hit.idSector ?? '',
  idRegion: hit.idRegion,
  name: hit.name,
  nameLocal: hit.nameLocal ?? null,
  grade: hit.grade ?? '',
  gradeScale: (hit.gradeScale ?? 'french') as GradeScale,
  sectorName: hit.sectorName ?? '',
  regionName: hit.regionName ?? ''
});
