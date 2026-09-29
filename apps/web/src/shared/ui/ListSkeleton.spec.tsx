import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ListSkeleton } from './ListSkeleton';

const skeletons = () => screen.getByTestId('list-skeleton').children;

describe('ListSkeleton', () => {
  it('draws one placeholder per expected item', () => {
    render(<ListSkeleton count={6} />);

    expect(skeletons()).toHaveLength(6);
  });

  it('draws the row shape when asked for one', () => {
    render(<ListSkeleton count={2} variant="row" />);

    expect(skeletons()).toHaveLength(2);
  });
});
