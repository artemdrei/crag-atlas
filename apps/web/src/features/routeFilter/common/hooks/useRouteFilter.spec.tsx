import {
  MemoryRouter,
  type NavigateFunction,
  Route,
  Routes,
  useLocation,
  useNavigate
} from 'react-router';

import { act, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { type RouteFilterState, useRouteFilter } from './useRouteFilter';

vi.mock('@web/app/providers', () => ({
  useModal: () => ({ openModal: vi.fn() }),
  useUser: () => ({ isAuthenticated: true })
}));

vi.mock('@web/shared/lib', () => ({ trackListControl: vi.fn() }));

const probe = {} as {
  state: RouteFilterState;
  search: string;
  navigate: NavigateFunction;
};

const Probe = () => {
  probe.state = useRouteFilter('routes');
  probe.search = useLocation().search;
  probe.navigate = useNavigate();

  return null;
};

const renderAt = (entry: string) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/regions/:idRegion" element={<Probe />} />
        <Route
          path="/regions/:idRegion/sectors/:idSector"
          element={<Probe />}
        />
      </Routes>
    </MemoryRouter>
  );

describe('useRouteFilter', () => {
  it('reads a first visit from the address', () => {
    renderAt('/regions/r1?grades=french%7C6a');

    expect(probe.state.filter.grades).toEqual(['french|6a']);
  });

  it('keeps a filter cleared in a sector cleared back in its region', () => {
    renderAt('/regions/r2?grades=french%7C6a');

    act(() => {
      probe.navigate('/regions/r2/sectors/s1?grades=french%7C6a');
    });
    act(() => {
      probe.state.clearFilters();
    });
    act(() => {
      probe.navigate(-1);
    });

    expect(probe.state.filter.grades).toEqual([]);
    expect(probe.search).toBe('');
  });

  it('does not carry one region filter into another', () => {
    renderAt('/regions/r3?grades=french%7C6a');

    act(() => {
      probe.navigate('/regions/r4');
    });

    expect(probe.state.filter.grades).toEqual([]);
  });
});
