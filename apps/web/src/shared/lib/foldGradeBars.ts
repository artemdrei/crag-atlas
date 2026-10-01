import type { GradeTone } from '@web/shared/theme/palette';

import type { GradeBar } from './gradeBars';

const EASY_TONE: GradeTone = '5';
const EASY_LABEL = '<5c';

export const foldGradeBars = (bars: GradeBar[], limit: number): GradeBar[] =>
  bars.length <= limit ? bars : foldPluses(foldEasy(bars));

// Everything below 6a is one step for a reader choosing a crag.
const foldEasy = (bars: GradeBar[]): GradeBar[] => {
  const easy = bars.filter(({ tone }) => tone === EASY_TONE);

  const [first] = easy;

  if (!first || easy.length < 2) return bars;

  const merged: GradeBar = {
    ...first,
    key: easy.map(({ key }) => key).join('+'),
    label: EASY_LABEL,
    count: easy.reduce((sum, { count }) => sum + count, 0)
  };

  return [merged, ...bars.filter(({ tone }) => tone !== EASY_TONE)];
};

const foldPluses = (bars: GradeBar[]): GradeBar[] => {
  const folded: GradeBar[] = [];

  for (const bar of bars) {
    const previous = folded[folded.length - 1];
    const base = bar.label.endsWith('+') ? bar.label.slice(0, -1) : null;

    if (base && previous?.label === base) {
      folded[folded.length - 1] = {
        ...previous,
        key: `${previous.key}+${bar.key}`,
        label: base,
        count: previous.count + bar.count
      };
      continue;
    }

    folded.push(bar);
  }

  return folded;
};
