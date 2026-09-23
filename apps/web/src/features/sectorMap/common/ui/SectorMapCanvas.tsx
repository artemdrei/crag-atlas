import { useEffect, useRef } from 'react';

import { useLingui } from '@lingui/react/macro';
import { styled, useTheme } from '@mui/material/styles';
import {
  GeolocateControl,
  LngLatBounds,
  Map as MapLibreMap,
  type MapMouseEvent,
  Marker,
  NavigationControl
} from 'maplibre-gl';

import { toast } from '@web/shared/lib';

import type { Coords, MappedSector } from '../entities';
import { sectorPinColor } from '../lib';

import 'maplibre-gl/dist/maplibre-gl.css';

const STYLE_URL = {
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
};

const SELECTED_CLASS = 'is-selected';

const UKRAINE_CENTER: [number, number] = [31.17, 48.38];
const UKRAINE_ZOOM = 5;
const SECTOR_ZOOM = 13;
const FIT_PADDING = 64;

export interface Props {
  points: MappedSector[];
  idSelectedSector?: string;
  isEditing?: boolean;
  onSelect: (idSector: string) => void;
  onPlace?: (point: Coords) => void;
}

export const SectorMapCanvas = ({
  points,
  idSelectedSector,
  isEditing,
  onSelect,
  onPlace
}: Props) => {
  const { t } = useLingui();
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap>(null);
  const hasFitRef = useRef(false);
  const markersRef = useRef(
    new Map<string, { marker: Marker; color: string }>()
  );

  const latestRef = useRef({
    points,
    mode: theme.palette.mode,
    onSelect,
    onPlace,
    onLocateError: (isDenied: boolean) =>
      toast.error(
        isDenied
          ? t`Location is blocked for this site. Allow it in the browser to see where you are.`
          : t`Could not read your location.`
      )
  });
  latestRef.current = {
    ...latestRef.current,
    points,
    mode: theme.palette.mode,
    onSelect,
    onPlace
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: STYLE_URL[latestRef.current.mode],
      center: UKRAINE_CENTER,
      zoom: UKRAINE_ZOOM,
      attributionControl: { compact: true }
    });

    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    const geolocate = new GeolocateControl({});

    geolocate.on('error', (error: GeolocationPositionError) =>
      latestRef.current.onLocateError(error.code === error.PERMISSION_DENIED)
    );
    map.addControl(geolocate, 'top-right');

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
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

    points.forEach(({ sector, point, toneIndex }) => {
      const color = sectorPinColor(theme.palette.sectorPin, toneIndex);
      const current = markers.get(sector.id);

      live.add(sector.id);

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
        latestRef.current.onSelect(sector.id);
      });

      markers.set(sector.id, { marker, color });
    });

    markers.forEach(({ marker }, idSector) => {
      if (!live.has(idSector)) {
        marker.remove();
        markers.delete(idSector);

        return;
      }

      marker
        .getElement()
        .classList.toggle(SELECTED_CLASS, idSector === idSelectedSector);
    });
  }, [points, idSelectedSector, theme.palette.sectorPin]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || hasFitRef.current || !points.length) return;

    hasFitRef.current = true;

    const bounds = points.reduce(
      (acc, { point }) => acc.extend([point.lng, point.lat]),
      new LngLatBounds()
    );

    map.fitBounds(bounds, { padding: FIT_PADDING, maxZoom: SECTOR_ZOOM });
  }, [points]);

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
      ({ sector }) => sector.id === idSelectedSector
    );

    if (!map || !selected) return;

    map.easeTo({
      center: [selected.point.lng, selected.point.lat],
      zoom: Math.max(map.getZoom(), SECTOR_ZOOM)
    });
  }, [idSelectedSector]);

  // MapLibre adds its own classes to whatever element it mounts into, and the
  // styled wrapper's class changes whenever `isEditing` does — React would then
  // rewrite `class` and wipe them, leaving markers unpositioned and spilling
  // out of the map. The element the map owns therefore gets no React class.
  return (
    <ShellStyled isEditing={!!isEditing}>
      <div ref={containerRef} />
    </ShellStyled>
  );
};

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
