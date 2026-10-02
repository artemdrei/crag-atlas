import type { RouteLine } from '@crag-atlas/api';
import { ThemeProvider } from '@mui/material/styles';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { createAppTheme } from '@web/shared/theme/theme';

import { TopoImage } from './TopoImage';

const theme = createAppTheme('light');

const verticalLine: RouteLine = {
  idRoute: 'route-1',
  idTopo: 'topo-1',
  routeName: 'Rozmaj',
  grade: '6b',
  gradeScale: 'french',
  points: [
    [0.5, 0.9],
    [0.5, 0.1]
  ],
  bolts: [],
  labelOffsetX: 0,
  labelOffsetY: 0
};

const renderImage = (onSelectRoute = vi.fn(), onSelectPhoto = vi.fn()) => {
  render(
    <ThemeProvider theme={theme}>
      <TopoImage
        photoUrl="photo.jpg"
        label="Photo 1"
        lines={[verticalLine]}
        onSelectRoute={onSelectRoute}
        onSelectPhoto={onSelectPhoto}
      />
    </ThemeProvider>
  );
  const overlay = screen.getByTitle('Photo 1').closest('svg') as SVGSVGElement;

  return { overlay, onSelectRoute, onSelectPhoto };
};

const tap = (overlay: SVGSVGElement, from: number, to = from) => {
  fireEvent.pointerDown(overlay, { clientX: from, clientY: 50 });
  fireEvent.click(overlay, { clientX: to, clientY: 50 });
};

beforeAll(() => {
  vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue(
    DOMRect.fromRect({ x: 0, y: 0, width: 100, height: 100 })
  );
});

describe('TopoImage', () => {
  it('opens the route when a tap lands on its line', () => {
    const { overlay, onSelectRoute, onSelectPhoto } = renderImage();

    tap(overlay, 50);

    expect(onSelectRoute).toHaveBeenCalledWith('route-1');
    expect(onSelectPhoto).not.toHaveBeenCalled();
  });

  it('opens the photo when a tap misses every line', () => {
    const { overlay, onSelectRoute, onSelectPhoto } = renderImage();

    tap(overlay, 10);

    expect(onSelectPhoto).toHaveBeenCalledOnce();
    expect(onSelectRoute).not.toHaveBeenCalled();
  });

  it('ignores a drag that only scrolled past the photo', () => {
    const { overlay, onSelectRoute, onSelectPhoto } = renderImage();

    tap(overlay, 10, 30);

    expect(onSelectPhoto).not.toHaveBeenCalled();
    expect(onSelectRoute).not.toHaveBeenCalled();
  });
});
