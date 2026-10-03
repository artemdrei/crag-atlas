export interface Point {
  lat: number;
  lng: number;
}

export interface Sample {
  azimuth: number;
  distanceM: number;
}

const EARTH_RADIUS_M = 6_371_008.8;

// Sampled every ten degrees and stored every one. The provider counts every
// coordinate it answers for, against five thousand an hour and ten thousand
// a day, so a whole catalog has to fit — nineteen sectors at six hundred
// samples each would exceed the day's budget on its own. The skyline is
// smooth enough that the gaps interpolate, and at ninety metres per cell the
// model cannot resolve a finer ray anyway. The single stored degree is what
// the output needs: the sun moves about fifteen degrees an hour, so reading
// the horizon off a ten degree bin would round "sun until 13:25" to the
// nearest forty minutes.
export const SAMPLE_AZIMUTH_STEP = 10;
export const PROFILE_SIZE = 360;

// Near terrain decides the skyline — the boulder thirty metres away blocks
// more sky than the ridge at fifteen kilometres — so the radii crowd the
// sector and thin out with distance.
const NEAREST_M = 50;
const FARTHEST_M = 20_000;
const RADIUS_STEPS = 6;

// A ring wide enough to cross the elevation model's own cells, so the slope
// is the hillside's and not one cell's rounding, and no wider — a wall is
// read from the ground at its foot, not from the next valley.
const ASPECT_RADIUS_M = 150;
const ASPECT_RAYS = 16;

export const RADII_M = Array.from({ length: RADIUS_STEPS }, (_, step) => {
  const ratio = step / (RADIUS_STEPS - 1);

  return Math.round(NEAREST_M * (FARTHEST_M / NEAREST_M) ** ratio);
});

export const horizonSamples = (): Sample[] =>
  Array.from(
    { length: PROFILE_SIZE / SAMPLE_AZIMUTH_STEP },
    (_, ray) => ray * SAMPLE_AZIMUTH_STEP
  ).flatMap((azimuth) => RADII_M.map((distanceM) => ({ azimuth, distanceM })));

export const aspectSamples = (): Sample[] =>
  Array.from({ length: ASPECT_RAYS }, (_, ray) => ({
    azimuth: (ray * 360) / ASPECT_RAYS,
    distanceM: ASPECT_RADIUS_M
  }));

export const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const toDegrees = (radians: number) => (radians * 180) / Math.PI;

export const destination = (
  { lat, lng }: Point,
  { azimuth, distanceM }: Sample
): Point => {
  const angular = distanceM / EARTH_RADIUS_M;
  const bearing = toRadians(azimuth);
  const latRad = toRadians(lat);
  const lngRad = toRadians(lng);

  const nextLat = Math.asin(
    Math.sin(latRad) * Math.cos(angular) +
      Math.cos(latRad) * Math.sin(angular) * Math.cos(bearing)
  );

  const nextLng =
    lngRad +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angular) * Math.cos(latRad),
      Math.cos(angular) - Math.sin(latRad) * Math.sin(nextLat)
    );

  return {
    lat: toDegrees(nextLat),
    lng: ((toDegrees(nextLng) + 540) % 360) - 180
  };
};

// Over twenty kilometres the planet curves away by about thirty metres, which
// is the height of the ridge being looked for. The coefficient is the usual
// allowance for the atmosphere bending the ray back down.
const REFRACTION = 0.13;

const curvatureDropM = (distanceM: number) =>
  ((1 - REFRACTION) * distanceM ** 2) / (2 * EARTH_RADIUS_M);

export const elevationAngle = (
  baseM: number,
  sampleM: number,
  distanceM: number
): number =>
  toDegrees(Math.atan2(sampleM - baseM - curvatureDropM(distanceM), distanceM));

// Tenths of a degree, and never below zero: a sector on a summit looks down
// on its surroundings, and a negative horizon would let the sun in before it
// has risen.
export const toProfile = (anglesByRay: number[]): number[] => {
  const rays = anglesByRay.length;

  return Array.from({ length: PROFILE_SIZE }, (_, degree) => {
    const position = (degree / 360) * rays;
    const before = Math.floor(position) % rays;
    const after = (before + 1) % rays;
    const weight = position - Math.floor(position);
    const angle =
      (anglesByRay[before] ?? 0) * (1 - weight) +
      (anglesByRay[after] ?? 0) * weight;

    return Math.max(0, Math.round(angle * 10));
  });
};

// Linear between the two stored degrees, so the moment the sun clears a ridge
// lands on a minute rather than on a bin edge.
export const horizonAt = (profile: number[], azimuth: number): number => {
  const position = ((azimuth % 360) + 360) % 360;
  const before = Math.floor(position);
  const after = (before + 1) % PROFILE_SIZE;
  const weight = position - before;

  return (
    ((profile[before] ?? 0) * (1 - weight) + (profile[after] ?? 0) * weight) /
    10
  );
};

// Where the ground falls away, as the sum of every direction pulling on it
// rather than the single lowest sample: one cell of a ninety metre model is
// noise, and a crag at the foot of a wall is surrounded by more of it than
// by the drop that matters. Null when the ring is flat enough that any
// direction would be a guess — an admin's `aspect_deg` is the real answer
// anywhere the model cannot see the wall at all.
const FLAT_SLOPE_M = 2;

export const aspectFromRing = (
  baseM: number,
  ringM: number[]
): number | null => {
  let north = 0;
  let east = 0;

  for (const [ray, heightM] of ringM.entries()) {
    const drop = baseM - heightM;
    const azimuth = ((ray * 360) / ringM.length) * (Math.PI / 180);

    north += drop * Math.cos(azimuth);
    east += drop * Math.sin(azimuth);
  }

  const strength = Math.hypot(north, east) / ringM.length;

  if (strength < FLAT_SLOPE_M) return null;

  return Math.round((toDegrees(Math.atan2(east, north)) + 360) % 360) % 360;
};

// How far the sun is round from the direction the wall looks. Past a right
// angle it is behind the wall, whatever the skyline does.
export const azimuthDifference = (one: number, other: number): number => {
  const raw = (((one - other) % 360) + 360) % 360;

  return raw > 180 ? 360 - raw : raw;
};
