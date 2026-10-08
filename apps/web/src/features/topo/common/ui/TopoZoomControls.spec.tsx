import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { i18n } from '@web/shared/i18n/i18n';

import { TopoZoomControls } from './TopoZoomControls';

const track = vi.fn();
const zoomIn = vi.fn();

vi.mock('@crag-atlas/analytics', () => ({
  track: (event: unknown) => track(event)
}));
vi.mock('react-zoom-pan-pinch', () => ({
  useControls: () => ({ zoomIn, zoomOut: vi.fn(), resetTransform: vi.fn() }),
  useTransformComponent: () => 1
}));

i18n.load('en', {});
i18n.activate('en');

const renderControls = (list?: 'sector' | 'topo_photo') =>
  render(
    <I18nProvider i18n={i18n}>
      <TopoZoomControls list={list} />
    </I18nProvider>
  );

describe('TopoZoomControls', () => {
  beforeEach(() => {
    track.mockClear();
    zoomIn.mockClear();
  });

  it('zooms and reports where it happened', () => {
    renderControls('topo_photo');
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));

    expect(zoomIn).toHaveBeenCalled();
    expect(track).toHaveBeenCalledWith({
      name: 'List Controls Used',
      props: { list: 'topo_photo', control: 'zoom', value: 'in' }
    });
  });

  it('stays silent in an editor', () => {
    renderControls();
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));

    expect(zoomIn).toHaveBeenCalled();
    expect(track).not.toHaveBeenCalled();
  });
});
