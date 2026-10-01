// Raw ids break aggregation in Amplitude. Every catalog id is a uuid, so a
// name can never be mistaken for one.
const isIdSegment = (segment: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    segment
  );

export const normalizePath = (pathname: string) => {
  if (pathname === '/') return '/';

  return pathname
    .split('/')
    .map((segment) => (isIdSegment(segment) ? ':id' : segment))
    .join('/');
};
