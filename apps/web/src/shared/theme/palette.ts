import type { ConditionBand, GradeScale, Tick } from '@crag-atlas/api';
import { alpha } from '@mui/material/styles';
import { getScoreForSort } from '@openbeta/sandbag';

export const GRADE_LEVELS = ['5', '6', '7', '8', '9'] as const;

export type GradeLevel = (typeof GRADE_LEVELS)[number];

export type GradeTone = GradeLevel | 'neutral';

export interface GradeColor {
  background: string;
  text: string;
}

export type AscentTypeTone = Tick['ascentType'];

interface Neutrals {
  background: { default: string; paper: string };
  divider: string;
}

// Difficulty reads from the hue, not from how loud the colour is.
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

// Told apart by hue, not shade: a bar stacks them side by side.
const ascentType: Record<
  'light' | 'dark',
  Record<AscentTypeTone, GradeColor>
> = {
  light: {
    onsight: { background: '#2E9E4F', text: '#FFFFFF' },
    flash: { background: '#1F9BB0', text: '#FFFFFF' },
    retro_flash: { background: '#4A6BB5', text: '#FFFFFF' },
    redpoint: { background: '#C0356B', text: '#FFFFFF' },
    toprope: { background: '#8A7F70', text: '#FFFFFF' },
    attempt: { background: '#C98A22', text: '#1A1310' }
  },
  dark: {
    onsight: { background: '#2E4A28', text: '#9FD481' },
    flash: { background: '#16414A', text: '#5FC3DA' },
    retro_flash: { background: '#22304F', text: '#8FB0F0' },
    redpoint: { background: '#45182C', text: '#F07AA6' },
    toprope: { background: '#2F2A25', text: '#C7BCAE' },
    attempt: { background: '#4A3F22', text: '#E8C55A' }
  }
};

// A conditions score reads as a traffic light: the eye finds the green day
// in the strip before it reads a single number.
const conditionBand: Record<'light' | 'dark', Record<ConditionBand, string>> = {
  light: {
    excellent: '#2E9E4F',
    good: '#7FA83C',
    ok: '#E3B505',
    poor: '#D9792B',
    bad: '#E8503C'
  },
  dark: {
    excellent: '#3FAF63',
    good: '#92C44F',
    ok: '#E8C55A',
    poor: '#E2963A',
    bad: '#E8503C'
  }
};

// Cycled by the sector's position in the list, so the dot beside a name and
// its pin always match.
const sectorPin: Record<'light' | 'dark', string[]> = {
  light: ['#C25A2A', '#B8963E', '#2E8E93', '#7B3FBF', '#2E9E4F', '#4A6BB5'],
  dark: ['#E2703A', '#E8C55A', '#62C2C7', '#9B5BE0', '#3FAF63', '#8FB0F0']
};

const editing: Record<'light' | 'dark', Neutrals> = {
  light: {
    background: { default: '#F9E1DB', paper: '#FFF1ED' },
    divider: '#E9C4BB'
  },
  dark: {
    background: { default: '#1F0910', paper: '#33131E' },
    divider: '#4E2130'
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
    ascentType: ascentType.light,
    conditionBand: conditionBand.light,
    sectorPin: sectorPin.light
  },
  dark: {
    background: { default: '#0B0A09', paper: '#1B1815' },
    text: { primary: '#F6F1E9', secondary: '#A69C8F' },
    primary: { main: '#E2703A', dark: '#F08A57' },
    secondary: { main: '#E8C55A' },
    divider: '#2A2521',
    grade: grade.dark,
    ascentType: ascentType.dark,
    conditionBand: conditionBand.dark,
    sectorPin: sectorPin.dark
  }
} as const;

export const resolvePalette = (mode: 'light' | 'dark', isEditing: boolean) =>
  isEditing ? { ...palette[mode], ...editing[mode] } : palette[mode];

// Boundaries read off the French scale, so a hue keeps the meaning it had
// before grades could arrive in any system: 5a and 5.8 look alike.
const TONE_THRESHOLDS = GRADE_LEVELS.map((level) => ({
  tone: level as GradeTone,
  score: getScoreForSort(`${level}a`, 'french')
})).reverse();

export const resolveGradeTone = (
  grade: string,
  scale: GradeScale
): GradeTone => {
  // An unreadable grade scores zero, which no real grade does.
  const score = getScoreForSort(grade, scale);

  if (!score) return 'neutral';

  return TONE_THRESHOLDS.find((level) => score >= level.score)?.tone ?? '5';
};

// Fill and ink swap roles with the mode.
export const resolveAscentTypeInk = (
  mode: 'light' | 'dark',
  tone: AscentTypeTone
): string =>
  mode === 'dark'
    ? ascentType.dark[tone].text
    : ascentType.light[tone].background;

// Ink is not the fill at full strength: the badge prints the grade on top of
// its own tinted fill, and a hue over 40% of itself can read as low as 1.2:1.
// These are the same hues taken to the lightness that clears 4.5:1 there.
const gradeInk: Record<'light' | 'dark', Record<GradeTone, string>> = {
  light: {
    '5': '#1D6331',
    '6': '#785F03',
    '7': '#9B2212',
    '8': '#603196',
    '9': '#1A1310',
    neutral: '#806742'
  },
  dark: {
    '5': '#7CD097',
    '6': '#F0D994',
    '7': '#F2998D',
    '8': '#C39CEC',
    '9': '#F9F6F1',
    neutral: '#C7C0B8'
  }
};

export const resolveGradeInk = (
  mode: 'light' | 'dark',
  tone: GradeTone
): string => gradeInk[mode][tone];

// The darkest tones vanish into the dark background, so their ink takes over.
export const resolveGradeHue = (
  mode: 'light' | 'dark',
  tone: GradeTone
): string =>
  mode === 'dark' && (tone === '9' || tone === 'neutral')
    ? grade.dark[tone].text
    : grade[mode][tone].background;

// The badge prints the grade on its fill, so the tint stays light enough for
// the ink above to clear AA; a chart bar carries no text and reads as colour.
export const resolveGradeFill = (mode: 'light' | 'dark', tone: GradeTone) =>
  alpha(resolveGradeHue(mode, tone), 0.4);

export const resolveGradeBar = (mode: 'light' | 'dark', tone: GradeTone) =>
  alpha(resolveGradeHue(mode, tone), 0.7);

export const getGradeColor = (
  grades: Record<GradeTone, GradeColor>,
  grade?: string,
  scale?: GradeScale | null
) =>
  grade && scale
    ? grades[resolveGradeTone(grade, scale)].background
    : undefined;

export const getScoreColor = (
  bands: Record<ConditionBand, string>,
  band?: ConditionBand | null
) => (band ? bands[band] : undefined);
