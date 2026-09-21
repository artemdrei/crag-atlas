import type { GradeScale } from '@crag-atlas/api';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createAppTheme } from '@web/shared/theme/theme';

import { GradeBadge } from './GradeBadge';

const theme = createAppTheme('light');

const renderBadge = (grade: string, scale?: GradeScale) =>
  render(
    <ThemeProvider theme={theme}>
      <GradeBadge grade={grade} scale={scale} />
    </ThemeProvider>
  );

const backgroundOf = (grade: string, scale?: GradeScale) => {
  const { container } = renderBadge(grade, scale);
  const chip = container.querySelector('.MuiChip-root') as HTMLElement;
  return getComputedStyle(chip).backgroundColor;
};

describe('GradeBadge', () => {
  it('renders the grade as given', () => {
    renderBadge('7a+', 'french');

    expect(screen.getByText('7a+')).toBeDefined();
  });

  it('tones a grade by difficulty, whatever system it is written in', () => {
    expect(backgroundOf('5.13b', 'yds')).toBe(backgroundOf('8a', 'french'));
    expect(backgroundOf('5.13b', 'yds')).not.toBe(backgroundOf('project'));
  });

  it('gives a range the neutral tone instead of picking one level', () => {
    expect(backgroundOf('5a-8b')).not.toBe(backgroundOf('5c', 'french'));
    expect(backgroundOf('5a-8b')).toBe(backgroundOf('project'));
  });

  it('gives each level its own color', () => {
    const backgrounds = ['5a', '6a', '7a', '8a', '9a'].map((grade) =>
      backgroundOf(grade, 'french')
    );

    expect(new Set(backgrounds).size).toBe(5);
  });

  it('keeps the neutral tone out of the difficulty scale', () => {
    const levels = ['5a', '6a', '7a', '8a', '9a'].map((grade) =>
      backgroundOf(grade, 'french')
    );

    expect(levels).not.toContain(backgroundOf('project'));
  });
});
