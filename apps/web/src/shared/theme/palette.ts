import type { Tick } from '@crag-atlas/api';

/** French sport grades bucketed by their leading number: 5a…5c, 6a…6c+, … */
export const GRADE_LEVELS = ['5', '6', '7', '8', '9'] as const;

export type GradeLevel = (typeof GRADE_LEVELS)[number];

/** Ranges and unreadable grades: a tone the difficulty scale never uses. */
export type GradeTone = GradeLevel | 'neutral';

export interface GradeColor {
  background: string;
  text: string;
}

export type AscentStyleTone = Tick['ascentStyle'];

// Distinct hue per level, the way gyms colour-code walls: green → yellow →
// red → purple → black. Every badge is a solid fill of the same intensity;
// difficulty reads from the hue, not from how loud the colour is.
const grade: Record<'light' | 'dark', Record<GradeTone, GradeColor>> = {
  light: {
    '5': { background: '#2E9E4F', text: '#FFFFFF' },
    '6': { background: '#E3B505', text: '#1A1310' },
    '7': { background: '#E8503C', text: '#FFFFFF' },
    '8': { background: '#7B3FBF', text: '#FFFFFF' },
    '9': { background: '#1A1310', text: '#F6F1E9' },
    neutral: { background: '#E4DACB', text: '#4A4036' }
  },
  dark: {
    '5': { background: '#3FAF63', text: '#07140C' },
    '6': { background: '#E8C55A', text: '#1A1310' },
    '7': { background: '#E8503C', text: '#1A0E0C' },
    '8': { background: '#9B5BE0', text: '#140A20' },
    '9': { background: '#000000', text: '#F6F1E9' },
    neutral: { background: '#2A2521', text: '#A69C8F' }
  }
};

// Ascent styles read as a scale of cleanliness: the ground-up styles share a
// green, the rehearsed ones cool down, and an attempt stays amber.
const ascentStyle: Record<
  'light' | 'dark',
  Record<AscentStyleTone, GradeColor>
> = {
  light: {
    onsight: { background: '#2E9E4F', text: '#FFFFFF' },
    flash: { background: '#2E8E93', text: '#FFFFFF' },
    retro_flash: { background: '#4A6BB5', text: '#FFFFFF' },
    redpoint: { background: '#6F8F3A', text: '#FFFFFF' },
    toprope: { background: '#8A7F70', text: '#FFFFFF' },
    attempt: { background: '#C98A22', text: '#1A1310' }
  },
  dark: {
    onsight: { background: '#2E4A28', text: '#9FD481' },
    flash: { background: '#20444A', text: '#62C2C7' },
    retro_flash: { background: '#22304F', text: '#8FB0F0' },
    redpoint: { background: '#33421F', text: '#B9D481' },
    toprope: { background: '#2F2A25', text: '#C7BCAE' },
    attempt: { background: '#4A3F22', text: '#E8C55A' }
  }
};

export const palette = {
  light: {
    background: { default: '#F6F1E9', paper: '#FFFFFF' },
    text: { primary: '#1A1310', secondary: '#6F6455' },
    primary: { main: '#C25A2A', dark: '#9C4720' },
    secondary: { main: '#B8963E' },
    divider: '#E4DACB',
    grade: grade.light,
    ascentStyle: ascentStyle.light
  },
  dark: {
    background: { default: '#0B0A09', paper: '#1B1815' },
    text: { primary: '#F6F1E9', secondary: '#A69C8F' },
    primary: { main: '#E2703A', dark: '#F08A57' },
    secondary: { main: '#E8C55A' },
    divider: '#2A2521',
    grade: grade.dark,
    ascentStyle: ascentStyle.dark
  }
} as const;

// A range spans several levels, so colouring it by one of them would lie —
// it gets the neutral tone, as does anything unreadable. Everything below 5
// reads as 5 and above 9 as 9: the scale groups routes by feel, not exhaustively.
export const resolveGradeTone = (grade: string): GradeTone => {
  const matches = grade.match(/\d\s*[abc]/gi) ?? [];

  if (matches.length !== 1) return 'neutral';

  const digit = matches[0][0];

  if (Number(digit) < 5) return '5';
  if (Number(digit) > 9) return '9';

  return digit as GradeTone;
};

/** Colour of a route's grade, for anything that is not a `GradeBadge`. */
export const getGradeColor = (
  grades: Record<GradeTone, GradeColor>,
  grade?: string
) => (grade ? grades[resolveGradeTone(grade)].background : undefined);
