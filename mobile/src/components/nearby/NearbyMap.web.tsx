import 'leaflet/dist/leaflet.css';

import type * as Leaflet from 'leaflet';
import { useEffect, useRef, useState } from 'react';

import type { NearbyMapProps } from './NearbyMap.types.ts';

type MapEngine = { L: typeof Leaflet; map: Leaflet.Map };

export default function NearbyMap(props: NearbyMapProps) {
  const { origin, markers, selectedPlaceId, recenterKey } = props;
  const container = useRef<HTMLDivElement>(null);
  const callbacks = useRef(props);
  const [engine, setEngine] = useState<MapEngine | null>(null);
  const [failed, setFailed] = useState(false);
  const [tileFailed, setTileFailed] = useState(false);
  const placeMarkers = useRef(new Map<string, Leaflet.Marker>());

  useEffect(() => { callbacks.current = props; });

  useEffect(() => {
    let disposed = false;
    let map: Leaflet.Map | undefined;
    let observer: ResizeObserver | undefined;
    // Leaflet touches window at import time; load only after the web mount.
    void import('leaflet').then((L) => {
      if (disposed || !container.current) return;
      map = L.map(container.current, { scrollWheelZoom: false }).setView([36.5, 127.8], 7);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      })
        .on('tileerror', () => { if (!disposed) setTileFailed(true); })
        .on('tileload', () => { if (!disposed) setTileFailed(false); })
        .addTo(map);
      observer = new ResizeObserver(() => map?.invalidateSize());
      observer.observe(container.current);
      setEngine({ L, map });
    }).catch(() => {
      if (!disposed) {
        setFailed(true);
        callbacks.current.onMapError?.();
      }
    });
    return () => {
      disposed = true;
      observer?.disconnect();
      map?.remove();
    };
  }, []);

  useEffect(() => {
    if (!engine) return;
    const { L, map } = engine;
    const group = L.layerGroup().addTo(map);
    const entries = new Map<string, Leaflet.Marker>();
    const icon = (color: string) => L.divIcon({
      className: '',
      html: '<span style="display:block;width:20px;height:20px;border:3px solid white;border-radius:50%;box-shadow:0 1px 5px #555;background:' + color + '"></span>',
      iconSize: [26, 26], iconAnchor: [13, 13],
    });
    if (origin) {
      const label = document.createElement('span');
      label.textContent = '현재 위치';
      L.marker([origin.latitude, origin.longitude], {
        icon: icon('#1677D2'), title: '현재 위치', alt: '현재 위치',
      }).bindTooltip(label, { permanent: true, direction: 'top' }).addTo(group);
    }
    markers.forEach((place) => {
      const popup = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = place.title;
      const meta = document.createElement('p');
      meta.textContent = [place.category, place.distanceLabel].filter(Boolean).join(' · ');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = '상세 보기';
      button.style.cssText = 'min-height:44px;padding:8px 14px;color:#5C3DFF;background:#F1EDFF;border:0;border-radius:8px;cursor:pointer';
      button.onclick = () => callbacks.current.onOpenPlace(place.id);
      popup.append(title, meta, button);
      const marker = L.marker([place.latitude, place.longitude], {
        icon: icon('#E05A47'), title: place.title, alt: place.title,
      }).bindPopup(popup, { maxWidth: 220 })
        .on('click', () => callbacks.current.onSelectPlace(place.id))
        .addTo(group);
      entries.set(place.id, marker);
    });
    placeMarkers.current = entries;
    return () => { group.remove(); placeMarkers.current.clear(); };
  }, [engine, markers, origin]);

  useEffect(() => {
    if (!engine) return;
    const points: Leaflet.LatLngTuple[] = markers.map((place) => [place.latitude, place.longitude]);
    if (origin) points.push([origin.latitude, origin.longitude]);
    if (points.length) engine.map.fitBounds(points, { padding: [36, 36], maxZoom: 15, animate: false });
  }, [engine, markers, origin, recenterKey]);

  useEffect(() => {
    if (!engine) return;
    placeMarkers.current.forEach((marker, id) => {
      const selected = id === selectedPlaceId;
      const dot = marker.getElement()?.firstElementChild as HTMLElement | null;
      if (dot) {
        dot.style.background = selected ? '#5C3DFF' : '#E05A47';
        dot.style.transform = selected ? 'scale(1.3)' : '';
      }
      marker.setZIndexOffset(selected ? 1000 : 0);
      if (selected) {
        engine.map.panTo(marker.getLatLng(), { animate: false });
        marker.openPopup();
      }
    });
  }, [engine, markers, origin, selectedPlaceId]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', isolation: 'isolate' }}>
      <div ref={container} aria-label="현재 위치와 주변 관광지 지도"
        style={{ width: '100%', height: '100%', minHeight: 240, background: '#F3F1FC' }} />
      {(!engine || failed || tileFailed) && (
        <div role="status" style={{
          position: 'absolute', bottom: 28, left: 12, right: 12, zIndex: 1000,
          padding: 10, borderRadius: 8, background: '#FFFFFF', color: '#4A3E75',
          fontSize: 12, textAlign: 'center', pointerEvents: 'none',
        }}>
          {failed || tileFailed
            ? '지도를 불러오지 못했어요. 연결 상태를 확인해주세요. 관광지 목록은 계속 이용할 수 있어요.'
            : '지도를 불러오는 중이에요…'}
        </div>
      )}
    </div>
  );
}
