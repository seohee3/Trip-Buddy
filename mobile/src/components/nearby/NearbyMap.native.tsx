import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker, type Region } from 'react-native-maps';

import type { NearbyMapProps } from './NearbyMap.types.ts';

const INITIAL_DELTA = 0.035;

class MapErrorBoundary extends Component<
  { children: ReactNode; onError?: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError?.();
  }

  render() {
    if (this.state.failed) {
      return (
        <View style={styles.fallback}>
          <Text style={styles.fallbackTitle}>지도를 표시하지 못했어요</Text>
          <Text style={styles.fallbackText}>아래 관광지 목록은 계속 이용할 수 있어요.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function NearbyMap(props: NearbyMapProps) {
  if (!props.origin) {
    return (
      <View style={styles.fallback}>
        <ActivityIndicator color="#5C3DFF" />
        <Text style={styles.fallbackText}>현재 위치를 확인하고 있어요.</Text>
      </View>
    );
  }

  return (
    <MapErrorBoundary onError={props.onMapError}>
      <NativeMap {...props} origin={props.origin} />
    </MapErrorBoundary>
  );
}

function NativeMap({
  origin,
  markers,
  selectedPlaceId,
  recenterKey,
  onSelectPlace,
  onOpenPlace,
}: NearbyMapProps & { origin: NonNullable<NearbyMapProps['origin']> }) {
  const mapRef = useRef<MapView | null>(null);
  const [isReady, setIsReady] = useState(false);

  const fitVisiblePoints = useCallback(() => {
    if (!isReady) return;
    const coordinates = [origin, ...markers.map(({ latitude, longitude }) => ({ latitude, longitude }))];
    if (coordinates.length === 1) {
      mapRef.current?.animateToRegion({
        ...origin,
        latitudeDelta: INITIAL_DELTA,
        longitudeDelta: INITIAL_DELTA,
      }, 300);
      return;
    }
    mapRef.current?.fitToCoordinates(coordinates, {
      animated: true,
      edgePadding: { top: 38, right: 38, bottom: 38, left: 38 },
    });
  }, [isReady, markers, origin]);

  useEffect(() => {
    fitVisiblePoints();
  }, [fitVisiblePoints]);

  useEffect(() => {
    if (!isReady || !selectedPlaceId) return;
    const selected = markers.find((marker) => marker.id === selectedPlaceId);
    if (!selected) return;
    mapRef.current?.animateToRegion({
      latitude: selected.latitude,
      longitude: selected.longitude,
      latitudeDelta: 0.012,
      longitudeDelta: 0.012,
    }, 280);
  }, [isReady, markers, selectedPlaceId]);

  useEffect(() => {
    if (!isReady || recenterKey === 0) return;
    const region: Region = {
      ...origin,
      latitudeDelta: INITIAL_DELTA,
      longitudeDelta: INITIAL_DELTA,
    };
    mapRef.current?.animateToRegion(region, 300);
  }, [isReady, origin, recenterKey]);

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={{ ...origin, latitudeDelta: INITIAL_DELTA, longitudeDelta: INITIAL_DELTA }}
      showsUserLocation
      showsMyLocationButton={false}
      loadingEnabled
      onMapReady={() => setIsReady(true)}
      accessibilityLabel="현재 위치와 주변 관광지 지도"
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
          pinColor={marker.id === selectedPlaceId ? '#5C3DFF' : '#E05A47'}
          zIndex={marker.id === selectedPlaceId ? 2 : 1}
          onPress={() => onSelectPlace(marker.id)}
          accessibilityLabel={`${marker.title} 지도 마커`}
        >
          <Callout onPress={() => onOpenPlace(marker.id)}>
            <View style={styles.callout}>
              <Text style={styles.calloutTitle}>{marker.title}</Text>
              <Text style={styles.calloutMeta}>
                {marker.category}{marker.distanceLabel ? ` · ${marker.distanceLabel}` : ''}
              </Text>
              <Text style={styles.calloutAction}>상세 보기</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { width: '100%', height: '100%' },
  fallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    backgroundColor: '#F3F1FC',
  },
  fallbackTitle: { color: '#333333', fontSize: 14, fontWeight: '800' },
  fallbackText: { color: '#777777', fontSize: 12, textAlign: 'center' },
  callout: { minWidth: 150, maxWidth: 220, paddingVertical: 5, paddingHorizontal: 3 },
  calloutTitle: { color: '#222222', fontSize: 14, fontWeight: '800' },
  calloutMeta: { marginTop: 4, color: '#777777', fontSize: 11 },
  calloutAction: { marginTop: 6, color: '#5C3DFF', fontSize: 11, fontWeight: '800' },
});
