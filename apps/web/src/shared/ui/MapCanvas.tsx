import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

import { useLingui } from '@lingui/react/macro';
import { alpha, styled, useTheme } from '@mui/material/styles';
import {
  GeolocateControl,
  LngLatBounds,
  Map as MapLibreMap,
  type MapMouseEvent,
  Marker,
  NavigationControl
} from 'maplibre-gl';

import { toast } from '@web/shared/lib';
import type { Coords, MapPoint } from '@web/shared/types';

import 'maplibre-gl/dist/maplibre-gl.css';

const STYLE_URL = {
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
};

const SELECTED_CLASS = 'is-selected';

// GeolocationPositionError.PERMISSION_DENIED, which the event MapLibre hands
// over does not expose.
const PERMISSION_DENIED = 1;

const SELECTED_ZOOM = 13;
const FIT_PADDING = 64;

const ZOOM_DURATION = 1_200;

// Outlives the component on purpose: a remount is not worth another flight.
const FLOWN_LIMIT = 50;

const flownTo = new Set<string>();

const rememberFlight = (key: string) => {
  flownTo.add(key);

  while (flownTo.size > FLOWN_LIMIT) {
    const [oldest] = flownTo;

    if (oldest === undefined) return;

    flownTo.delete(oldest);
  }
};

// Every call site builds its points inline, so identity changes on each parent
// render while the framing stays the same.
const framingKey = (points: MapPoint[], maxZoom: number): string =>
  `${maxZoom}|${points
    .map(({ id, point }) => `${id}:${point.lng},${point.lat}`)
    .sort()
    .join('|')}`;

const boundsOf = (points: MapPoint[]): LngLatBounds =>
  points.reduce(
    (acc, { point }) => acc.extend([point.lng, point.lat]),
    new LngLatBounds()
  );

export interface Props {
  points: MapPoint[];
  details?: ReactNode;
  idSelected?: string;
  selectedZoom?: number;
  isEditing?: boolean;
  onSelect: (id: string) => void;
  onPlace?: (point: Coords) => void;
}

export const MapCanvas = ({
  points,
  details,
  idSelected,
  selectedZoom = SELECTED_ZOOM,
  isEditing,
  onSelect,
  onPlace
}: Props) => {
  const { t } = useLingui();
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap>(null);
  const fittedKeyRef = useRef<string>(null);
  const hasSelectedRef = useRef(false);
  // Fitting before the map has a canvas to measure leaves it on the world.
  const [isReady, setIsReady] = useState(false);
  const markersRef = useRef(
    new Map<
      string,
      { marker: Marker; color: string; lng: number; lat: number }
    >()
  );
  const onLocateError = (isDenied: boolean) =>
    toast.error(
      isDenied
        ? t`Location is blocked for this site. Allow it in the browser to see where you are.`
        : t`Could not read your location.`
    );

  const latestRef = useRef({
    points,
    selectedZoom,
    idSelected,
    mode: theme.palette.mode,
    onSelect,
    onPlace,
    onLocateError
  });
  latestRef.current.points = points;
  latestRef.current.selectedZoom = selectedZoom;
  latestRef.current.idSelected = idSelected;
  latestRef.current.mode = theme.palette.mode;
  latestRef.current.onSelect = onSelect;
  latestRef.current.onPlace = onPlace;
  latestRef.current.onLocateError = onLocateError;

  useEffect(() => {
    if (!containerRef.current) return;

    const { points: initial, selectedZoom: initialZoom } = latestRef.current;
    const initialKey = framingKey(initial, initialZoom);
    // A framing already flown to is where the map is born: fitting it after
    // `load` shows one painted frame of the world first, and the jump reads
    // as a flicker.
    const isAlreadyFramed = initial.length > 0 && flownTo.has(initialKey);

    const map = new MapLibreMap({
      container: containerRef.current,
      style: STYLE_URL[latestRef.current.mode],
      attributionControl: { compact: true },
      ...(isAlreadyFramed && {
        bounds: boundsOf(initial),
        fitBoundsOptions: { padding: FIT_PADDING, maxZoom: initialZoom }
      })
    });

    if (isAlreadyFramed) fittedKeyRef.current = initialKey;

    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    const geolocate = new GeolocateControl({});

    geolocate.on('error', (event: unknown) =>
      latestRef.current.onLocateError(isPermissionDenied(event))
    );
    map.addControl(geolocate, 'top-right');

    map.on('load', () => setIsReady(true));

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  // Re-applying the style the map was built with restarts a load in flight,
  // and the basemap then never asks for a tile.
  const styleRef = useRef(STYLE_URL[theme.palette.mode]);

  useEffect(() => {
    const style = STYLE_URL[theme.palette.mode];

    if (style === styleRef.current) return;

    styleRef.current = style;
    mapRef.current?.setStyle(style);
  }, [theme.palette.mode]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) return;

    const markers = markersRef.current;
    const live = new Set<string>();

    points.forEach(({ id, point, color }) => {
      const current = markers.get(id);

      live.add(id);

      if (current?.color === color) {
        if (current.lng !== point.lng || current.lat !== point.lat) {
          current.marker.setLngLat([point.lng, point.lat]);
          current.lng = point.lng;
          current.lat = point.lat;
        }

        return;
      }

      current?.marker.remove();

      const marker = new Marker({ color })
        .setLngLat([point.lng, point.lat])
        .addTo(map);

      marker.getElement().addEventListener('click', (event) => {
        event.stopPropagation();
        latestRef.current.onSelect(id);
      });

      marker
        .getElement()
        .classList.toggle(SELECTED_CLASS, id === latestRef.current.idSelected);

      markers.set(id, { marker, color, lng: point.lng, lat: point.lat });
    });

    markers.forEach(({ marker }, id) => {
      if (live.has(id)) return;

      marker.remove();
      markers.delete(id);
    });
  }, [points]);

  useEffect(() => {
    markersRef.current.forEach(({ marker }, id) => {
      marker.getElement().classList.toggle(SELECTED_CLASS, id === idSelected);
    });
  }, [idSelected]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !isReady || !points.length) return;

    // Refitting would move the ground under the crosshair on every click.
    if (isEditing && fittedKeyRef.current) return;

    const key = framingKey(points, selectedZoom);

    if (key === fittedKeyRef.current) return;

    fittedKeyRef.current = key;

    map.fitBounds(boundsOf(points), {
      padding: FIT_PADDING,
      maxZoom: selectedZoom,
      duration: flownTo.has(key) ? 0 : ZOOM_DURATION
    });

    rememberFlight(key);
  }, [points, selectedZoom, isReady, isEditing]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !isEditing) return;

    const place = (event: MapMouseEvent) =>
      latestRef.current.onPlace?.({
        lat: event.lngLat.lat,
        lng: event.lngLat.lng
      });

    map.on('click', place);

    return () => {
      map.off('click', place);
    };
  }, [isEditing]);

  useEffect(() => {
    const map = mapRef.current;
    const selected = latestRef.current.points.find(
      ({ id }) => id === idSelected
    );

    if (!map || !selected) return;

    // Flying to the initial selection would undo the fit.
    if (!hasSelectedRef.current) {
      hasSelectedRef.current = true;

      return;
    }

    map.easeTo({
      center: [selected.point.lng, selected.point.lat],
      zoom: Math.max(map.getZoom(), selectedZoom),
      duration: ZOOM_DURATION
    });
  }, [idSelected, selectedZoom]);

  // No React class on the element the map owns: MapLibre writes its own, and
  // a React rewrite wipes them, leaving markers unpositioned.
  return (
    <ShellStyled isEditing={!!isEditing}>
      <div ref={containerRef} />
      {details && <DetailsStyled>{details}</DetailsStyled>}
    </ShellStyled>
  );
};

// MapLibre copies the properties onto an event of its own, so `code` is there
// at runtime while the declared type promises nothing.
const isPermissionDenied = (event: unknown): boolean =>
  typeof event === 'object' &&
  event !== null &&
  'code' in event &&
  (event as { code: unknown }).code === PERMISSION_DENIED;

const DetailsStyled = styled('div')`
  position: absolute;
  left: ${({ theme }) => theme.spacing(1.5)};
  bottom: ${({ theme }) => theme.spacing(1.5)};
  z-index: 1;
  width: max-content;
  max-width: calc(100% - ${({ theme }) => theme.spacing(3)});
  max-height: calc(100% - ${({ theme }) => theme.spacing(3)});
  overflow: auto;
`;

const ShellStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isEditing'
})<{ isEditing: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  overflow: hidden;

  & > div:first-child {
    width: 100%;
    height: 100%;
  }

  .maplibregl-canvas {
    cursor: ${({ isEditing }) => (isEditing ? 'crosshair' : 'grab')};
  }

  .maplibregl-ctrl-attrib {
    background-color: ${({ theme }) =>
      alpha(theme.palette.background.paper, 0.6)};
    color: ${({ theme }) => theme.palette.text.secondary};
    font-size: 10px;
  }

  .maplibregl-ctrl-attrib a {
    color: inherit;
  }

  .maplibregl-ctrl-attrib-button {
    opacity: 0.6;
  }

  .maplibregl-marker.${SELECTED_CLASS} svg {
    transform: scale(1.35);
    transform-origin: bottom center;
  }

  .maplibregl-marker.${SELECTED_CLASS} {
    z-index: 1;
    filter: ${({ theme }) => {
      const ring = theme.palette.text.primary;

      return `drop-shadow(1.5px 0 0 ${ring}) drop-shadow(-1.5px 0 0 ${ring})
        drop-shadow(0 1.5px 0 ${ring}) drop-shadow(0 -1.5px 0 ${ring})`;
    }};
  }
`;
