import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useLingui } from '@lingui/react/macro';
import { styled, useTheme } from '@mui/material/styles';
import {
  GeolocateControl,
  LngLatBounds,
  Map as MapLibreMap,
  type MapMouseEvent,
  Marker,
  NavigationControl,
  Popup
} from 'maplibre-gl';

import { toast } from '@web/shared/lib';
import type { Coords, MapPoint } from '@web/shared/types';

import 'maplibre-gl/dist/maplibre-gl.css';

const STYLE_URL = {
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
};

const SELECTED_CLASS = 'is-selected';

// GeolocationPositionError.PERMISSION_DENIED. The interface constant is not
// reliably reachable through the event MapLibre hands over, so the value is
// named here instead.
const PERMISSION_DENIED = 1;

const SELECTED_ZOOM = 13;
const FIT_PADDING = 64;

// Well over MapLibre's own 500 ms: the flight from the world to one crag
// crosses most of a continent, and at half a second that reads as a cut
// rather than a journey.
const ZOOM_DURATION = 1_200;

// Clear of the marker, which hangs above the coordinate it marks.
const DETAILS_OFFSET: [number, number] = [0, 12];

// Which framings this tab has already flown to. The flight says where in the
// world this is, which is worth 1.2 s on arrival and nothing on the way back —
// and coming back remounts the component, so the memory has to outlive it.
// A reload is a fresh arrival, so this is deliberately not persisted.
const flownTo = new Set<string>();

// The fit follows the points themselves, not the array holding them: every
// call site builds that array inline, so identity changes on each parent
// render while the framing it asks for is the same one.
const framingKey = (points: MapPoint[], maxZoom: number): string =>
  `${maxZoom}|${points
    .map(({ id, point }) => `${id}:${point.lng},${point.lat}`)
    .sort()
    .join('|')}`;

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
  // Fitting before the map has a canvas to measure computes the camera
  // against nothing and the map stays on the world.
  const [isReady, setIsReady] = useState(false);
  const markersRef = useRef(
    new Map<string, { marker: Marker; color: string }>()
  );
  const detailsRef = useRef<Popup>(null);
  const detailsNodeRef = useRef<HTMLDivElement>(null);

  if (!detailsNodeRef.current) {
    detailsNodeRef.current = document.createElement('div');
  }

  const onLocateError = (isDenied: boolean) =>
    toast.error(
      isDenied
        ? t`Location is blocked for this site. Allow it in the browser to see where you are.`
        : t`Could not read your location.`
    );

  const latestRef = useRef({
    points,
    mode: theme.palette.mode,
    onSelect,
    onPlace,
    onLocateError
  });
  latestRef.current.points = points;
  latestRef.current.mode = theme.palette.mode;
  latestRef.current.onSelect = onSelect;
  latestRef.current.onPlace = onPlace;
  latestRef.current.onLocateError = onLocateError;

  useEffect(() => {
    if (!containerRef.current) return;

    // No starting view of our own: the map opens on the world and the points
    // themselves decide where it lands, so a catalog outside one country is
    // not looking at the wrong continent.
    const map = new MapLibreMap({
      container: containerRef.current,
      style: STYLE_URL[latestRef.current.mode],
      attributionControl: { compact: true }
    });

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
      detailsRef.current = null;
    };
  }, []);

  // Re-applying the style the map was built with restarts a load that is still
  // in flight, and the basemap then never asks for a single tile.
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
        current.marker.setLngLat([point.lng, point.lat]);

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

      markers.set(id, { marker, color });
    });

    markers.forEach(({ marker }, id) => {
      if (!live.has(id)) {
        marker.remove();
        markers.delete(id);

        return;
      }

      marker.getElement().classList.toggle(SELECTED_CLASS, id === idSelected);
    });
  }, [points, idSelected]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !isReady || !points.length) return;

    // The camera frames the catalog, and a point being placed is not part of
    // it yet: every click would otherwise move the ground under the crosshair.
    // The first framing still happens, so a map opened in this mode is not
    // left on the world.
    if (isEditing && fittedKeyRef.current) return;

    const key = framingKey(points, selectedZoom);

    // Already framed this way, so there is nothing to move the camera to —
    // and moving it anyway would undo the reader's own pan and zoom.
    if (key === fittedKeyRef.current) return;

    fittedKeyRef.current = key;

    const bounds = points.reduce(
      (acc, { point }) => acc.extend([point.lng, point.lat]),
      new LngLatBounds()
    );

    map.fitBounds(bounds, {
      padding: FIT_PADDING,
      maxZoom: selectedZoom,
      duration: flownTo.has(key) ? 0 : ZOOM_DURATION
    });

    flownTo.add(key);
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

    map.easeTo({
      center: [selected.point.lng, selected.point.lat],
      zoom: Math.max(map.getZoom(), selectedZoom),
      duration: ZOOM_DURATION
    });
  }, [idSelected, selectedZoom]);

  const hasDetails = !!details;

  useEffect(() => {
    const map = mapRef.current;
    const node = detailsNodeRef.current;
    const selected = points.find(({ id }) => id === idSelected);

    if (!map || !node || !hasDetails || !selected) {
      detailsRef.current?.remove();

      return;
    }

    const popup =
      detailsRef.current ??
      new Popup({
        closeButton: false,
        closeOnClick: false,
        anchor: 'top',
        offset: DETAILS_OFFSET,
        maxWidth: 'none'
      }).setDOMContent(node);

    detailsRef.current = popup;
    popup.setLngLat([selected.point.lng, selected.point.lat]).addTo(map);
  }, [points, idSelected, hasDetails]);

  // MapLibre adds its own classes to whatever element it mounts into, and the
  // styled wrapper's class changes whenever `isEditing` does — React would then
  // rewrite `class` and wipe them, leaving markers unpositioned and spilling
  // out of the map. The element the map owns therefore gets no React class.
  return (
    <ShellStyled isEditing={!!isEditing}>
      <div ref={containerRef} />
      {details && createPortal(details, detailsNodeRef.current)}
    </ShellStyled>
  );
};

// MapLibre wraps the browser's GeolocationPositionError in an event of its
// own and copies the properties across, so `code` is there at runtime while
// the event's declared type promises nothing about it.
const isPermissionDenied = (event: unknown): boolean =>
  typeof event === 'object' &&
  event !== null &&
  'code' in event &&
  (event as { code: unknown }).code === PERMISSION_DENIED;

const ShellStyled = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isEditing'
})<{ isEditing: boolean }>`
  width: 100%;
  height: 100%;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  overflow: hidden;

  & > div {
    width: 100%;
    height: 100%;
  }

  .maplibregl-canvas {
    cursor: ${({ isEditing }) => (isEditing ? 'crosshair' : 'grab')};
  }

  /* The popup is only a positioner here: the card inside brings its own
     surface, so MapLibre's white box and tip would show around it. */
  .maplibregl-popup-content {
    padding: 0;
    background: none;
    border-radius: 0;
    box-shadow: none;
  }

  .maplibregl-popup-tip {
    display: none;
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
