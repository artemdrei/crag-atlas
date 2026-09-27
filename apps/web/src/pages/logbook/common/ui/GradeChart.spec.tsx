import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { createAppTheme } from '@web/shared/theme/theme';

import type { GradeBar } from '../entities';
import { GradeChart } from './GradeChart';

const theme = createAppTheme('light');

const bar = (grade: string, counts: GradeBar['counts']): GradeBar => ({
  grade,
  sourceGrade: grade,
  scale: 'french',
  score: 0,
  total: Object.values(counts).reduce((sum, count) => sum + count, 0),
  counts
});

const renderChart = (bars: GradeBar[]) =>
  render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <GradeChart bars={bars} />
      </ThemeProvider>
    </I18nProvider>
  );

describe('GradeChart', () => {
  beforeAll(() => {
    i18n.load('en', {});
    i18n.activate('en');
  });

  it('shows a grade with the number of its ascents', () => {
    renderChart([bar('7a', { redpoint: 2 })]);

    expect(screen.getByText('7a')).toBeDefined();
    expect(screen.getByText('/ 2')).toBeDefined();
  });

  it('splits a bar into one segment per ascent type', () => {
    const { container } = renderChart([bar('6a', { onsight: 1, flash: 2 })]);
    const segments = [
      ...container.querySelectorAll<HTMLElement>('[data-ascent-type]')
    ];

    expect(segments.map((node) => node.dataset.ascentType)).toEqual([
      'onsight',
      'flash'
    ]);
  });

  it('renders nothing without a single graded ascent', () => {
    const { container } = renderChart([]);

    expect(container.firstChild).toBeNull();
  });
});
