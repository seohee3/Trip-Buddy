import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchLocationBasedTourPlaces, TourApiRequestError } from '@/src/api/tourApi';
import NearbyMap from '@/src/components/nearby/NearbyMap';
import { useTravelType } from '@/src/context/TravelTypeContext';
import { normalizeGeocodedRegion, normalizeTourPlaceRegion } from '@/src/nearby/currentRegion';
import {
  buildLocationRequestValues,
  calculateHaversineDistance,
  createNearbyMarkerData,
  filterNearbyPlaces,
  formatDistance,
  isValidCoordinates,
  NEARBY_RADIUS_METERS,
  prepareNearbyPlaces,
  sortNearbyPlaces,
  TOUR_CONTENT_TYPE_LABELS,
  type Coordinates,
  type NearbyPlace,
  type NearbySortOption,
} from '@/src/nearby/nearbyLogic';
import { TRAVEL_TYPE_BY_CODE } from '@/src/travel-type/catalog';

const COLORS = {
  primary: '#5C3DFF',
  primaryDark: '#4A32D4',
  primaryLight: '#F1EDFF',
  selectedTab: '#E6DEFF',
  background: '#FFFFFF',
  surface: '#F8F7FF',
  text: '#222222',
  secondaryText: '#777777',
  border: '#EEEEEE',
  danger: '#B42318',
};

const SORT_OPTIONS: readonly { key: NearbySortOption; label: string }[] = [
  { key: 'recommendation', label: '추천순' },
  { key: 'distance', label: '거리순' },
  { key: 'name', label: '이름순' },
];

const LOCATION_TIMEOUT_MS = 12000;
const LAST_POSITION_MAX_AGE_MS = 5 * 60 * 1000;
const MEMORY_CACHE_MAX_AGE_MS = 2 * 60 * 1000;

type LoadState =
  | 'checking-permission'
  | 'permission-required'
  | 'permission-denied'
  | 'permission-blocked'
  | 'services-disabled'
  | 'locating'
  | 'loading-places'
  | 'ready'
  | 'empty'
  | 'location-timeout'
  | 'location-unavailable'
  | 'location-error'
  | 'missing-key'
  | 'api-error';

type NearbyMemoryCache = {
  savedAt: number;
  coordinates: Coordinates;
  places: NearbyPlace[];
  regionLabel: string;
};

let nearbyMemoryCache: NearbyMemoryCache | null = null;

class PositionTimeoutError extends Error {}

function withTimeout<T>(promise: Promise<T>, milliseconds: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new PositionTimeoutError()), milliseconds);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); },
    );
  });
}

function locationObjectToCoordinates(location: Location.LocationObject | null): Coordinates | null {
  if (!location) return null;
  const coordinates = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
  return isValidCoordinates(coordinates) ? coordinates : null;
}

export default function NearbyScreen() {
  const { travelType } = useTravelType();
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [regionLabel, setRegionLabel] = useState('현재 위치');
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('checking-permission');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState('');
  const [sortOption, setSortOption] = useState<NearbySortOption>('recommendation');
  const [searchInput, setSearchInput] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [recenterKey, setRecenterKey] = useState(0);
  const [mapError, setMapError] = useState(false);
  const mountedRef = useRef(true);
  const requestLockedRef = useRef(false);
  const requestSequenceRef = useRef(0);
  const placesRef = useRef<NearbyPlace[]>([]);

  const preference = travelType ? TRAVEL_TYPE_BY_CODE[travelType.code] : null;

  useEffect(() => {
    placesRef.current = places;
  }, [places]);

  const applySuccessfulResult = useCallback((cache: NearbyMemoryCache) => {
    setCoordinates(cache.coordinates);
    setPlaces(cache.places);
    placesRef.current = cache.places;
    setRegionLabel(cache.regionLabel);
    setLoadState(cache.places.length > 0 ? 'ready' : 'empty');
  }, []);

  const loadNearby = useCallback(async ({
    requestPermission = false,
    force = false,
  }: { requestPermission?: boolean; force?: boolean } = {}) => {
    if (requestLockedRef.current) return;
    requestLockedRef.current = true;
    const requestId = ++requestSequenceRef.current;
    const canUpdate = () => mountedRef.current && requestId === requestSequenceRef.current;

    if (force) setIsRefreshing(true);
    setNotice('');
    setSearchMessage('');

    try {
      setLoadState('checking-permission');
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!canUpdate()) return;
      if (!servicesEnabled) {
        setCoordinates(null);
        setPlaces([]);
        placesRef.current = [];
        setRegionLabel('현재 위치');
        setLoadState('services-disabled');
        return;
      }

      let permission = await Location.getForegroundPermissionsAsync();
      if (!canUpdate()) return;
      if (permission.status !== 'granted' && requestPermission && permission.canAskAgain) {
        setLoadState('checking-permission');
        permission = await Location.requestForegroundPermissionsAsync();
      }
      if (!canUpdate()) return;
      if (permission.status !== 'granted') {
        setCoordinates(null);
        setPlaces([]);
        placesRef.current = [];
        setRegionLabel('현재 위치');
        setLoadState(permission.canAskAgain
          ? (requestPermission ? 'permission-denied' : 'permission-required')
          : 'permission-blocked');
        return;
      }

      if (
        !force
        && nearbyMemoryCache
        && Date.now() - nearbyMemoryCache.savedAt <= MEMORY_CACHE_MAX_AGE_MS
      ) {
        applySuccessfulResult(nearbyMemoryCache);
        return;
      }

      setLoadState('locating');
      let lastKnown: Location.LocationObject | null = null;
      try {
        lastKnown = await Location.getLastKnownPositionAsync({
          maxAge: LAST_POSITION_MAX_AGE_MS,
          requiredAccuracy: 1000,
        });
      } catch {
        lastKnown = null;
      }
      const lastKnownCoordinates = locationObjectToCoordinates(lastKnown);
      if (lastKnownCoordinates && canUpdate()) setCoordinates(lastKnownCoordinates);

      let currentLocation: Location.LocationObject | null = null;
      try {
        currentLocation = await withTimeout(
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          LOCATION_TIMEOUT_MS,
        );
      } catch (error) {
        if (!lastKnownCoordinates) {
          if (!canUpdate()) return;
          setCoordinates(null);
          setPlaces([]);
          placesRef.current = [];
          setLoadState(error instanceof PositionTimeoutError ? 'location-timeout' : 'location-error');
          return;
        }
        if (canUpdate()) setNotice('현재 위치 확인이 지연되어 최근 위치를 사용했어요.');
      }

      const currentCoordinates = locationObjectToCoordinates(currentLocation);
      const resolvedCoordinates = currentCoordinates ?? lastKnownCoordinates;
      if (!resolvedCoordinates || !canUpdate()) {
        if (canUpdate()) {
          setCoordinates(null);
          setPlaces([]);
          placesRef.current = [];
          setLoadState('location-unavailable');
        }
        return;
      }

      buildLocationRequestValues(resolvedCoordinates, NEARBY_RADIUS_METERS);
      setCoordinates(resolvedCoordinates);
      setLoadState('loading-places');
      setAppliedQuery('');
      setSearchInput('');
      setSelectedPlaceId(null);

      const [tourOutcome, geocodeOutcome] = await Promise.allSettled([
        fetchLocationBasedTourPlaces({
          latitude: resolvedCoordinates.latitude,
          longitude: resolvedCoordinates.longitude,
          radius: NEARBY_RADIUS_METERS,
          numOfRows: 50,
          pageNo: 1,
        }),
        Location.reverseGeocodeAsync(resolvedCoordinates),
      ]);
      if (!canUpdate()) return;

      const geocodedAddress = geocodeOutcome.status === 'fulfilled'
        ? geocodeOutcome.value[0]
        : undefined;
      const geocodedRegion = normalizeGeocodedRegion(geocodedAddress);

      if (tourOutcome.status === 'rejected') {
        if (geocodedRegion) setRegionLabel(geocodedRegion.fullRegionName);
        const canKeepPreviousPlaces = Boolean(
          nearbyMemoryCache
          && placesRef.current.length > 0
          && calculateHaversineDistance(
            nearbyMemoryCache.coordinates,
            resolvedCoordinates,
          ) <= 500,
        );
        if (canKeepPreviousPlaces) {
          setLoadState('ready');
          setNotice('새로고침하지 못해 이전 주변 관광지를 유지하고 있어요.');
          return;
        }
        setPlaces([]);
        placesRef.current = [];
        const error = tourOutcome.reason;
        setLoadState(error instanceof TourApiRequestError && error.kind === 'missing-key'
          ? 'missing-key'
          : 'api-error');
        return;
      }

      const nearbyPlaces = prepareNearbyPlaces(
        tourOutcome.value.places,
        resolvedCoordinates,
        NEARBY_RADIUS_METERS,
      );
      const nearestRegion = nearbyPlaces.length > 0
        ? normalizeTourPlaceRegion(nearbyPlaces[0])
        : undefined;
      const resolvedRegionLabel = geocodedRegion?.fullRegionName
        ?? nearestRegion?.fullRegionName
        ?? '현재 위치';
      const cache: NearbyMemoryCache = {
        savedAt: Date.now(),
        coordinates: resolvedCoordinates,
        places: nearbyPlaces,
        regionLabel: resolvedRegionLabel,
      };
      nearbyMemoryCache = cache;
      applySuccessfulResult(cache);
      setRecenterKey((value) => value + 1);
    } catch {
      if (canUpdate()) {
        setCoordinates(null);
        setPlaces([]);
        placesRef.current = [];
        setRegionLabel('현재 위치');
        setLoadState('location-error');
      }
    } finally {
      if (requestId === requestSequenceRef.current) {
        requestLockedRef.current = false;
        if (canUpdate()) setIsRefreshing(false);
      }
    }
  }, [applySuccessfulResult]);

  useEffect(() => {
    mountedRef.current = true;
    void loadNearby();
    return () => {
      mountedRef.current = false;
      requestSequenceRef.current += 1;
      requestLockedRef.current = false;
    };
  }, [loadNearby]);

  const visiblePlaces = useMemo(() => {
    const filtered = filterNearbyPlaces(places, appliedQuery);
    return sortNearbyPlaces(filtered, sortOption, preference);
  }, [appliedQuery, places, preference, sortOption]);

  const markerData = useMemo(() => createNearbyMarkerData(visiblePlaces), [visiblePlaces]);
  const isBusy = loadState === 'checking-permission'
    || loadState === 'locating'
    || loadState === 'loading-places';

  const useCurrentLocation = () => {
    setRecenterKey((value) => value + 1);
    void loadNearby({ requestPermission: true, force: true });
  };

  const submitSearch = () => {
    const query = searchInput.trim();
    if (!query) {
      setSearchMessage('검색어를 입력해주세요.');
      return;
    }
    setAppliedQuery(query);
    setSearchInput(query);
    setSearchMessage('');
    setSelectedPlaceId(null);
  };

  const resetSearch = () => {
    setSearchInput('');
    setAppliedQuery('');
    setSearchMessage('');
    setSelectedPlaceId(null);
  };

  const openPlace = (place: NearbyPlace) => {
    setSelectedPlaceId(place.id);
    router.push({
      pathname: '/place/[id]',
      params: {
        id: place.id,
        title: place.title,
        areaName: place.areaName,
        sigunguName: place.sigunguName,
        address: place.address,
        category: TOUR_CONTENT_TYPE_LABELS[place.contentTypeId] ?? '관광정보',
        image: place.image,
        distanceLabel: formatDistance(place.distanceMeters),
        mapX: place.mapX ?? '',
        mapY: place.mapY ?? '',
      },
    });
  };

  const openPlaceById = (placeId: string) => {
    const place = visiblePlaces.find((item) => item.id === placeId);
    if (place) openPlace(place);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={(
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void loadNearby({ requestPermission: true, force: true })}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        )}
      >
        <Pressable
          style={({ pressed }) => [styles.regionButton, pressed && styles.pressedButton]}
          onPress={useCurrentLocation}
          accessibilityRole="button"
          accessibilityLabel={`${regionLabel}, 현재 위치 다시 불러오기`}
        >
          <Ionicons name="location-outline" size={17} color={COLORS.primary} />
          <Text style={styles.regionText} numberOfLines={1}>{regionLabel}</Text>
          <Ionicons name="refresh" size={15} color={COLORS.secondaryText} />
        </Pressable>

        <Text style={styles.screenTitle}>주변</Text>

        <View style={styles.sortTabs}>
          {SORT_OPTIONS.map((option) => {
            const isSelected = option.key === sortOption;
            return (
              <Pressable
                key={option.key}
                style={[styles.sortTab, isSelected && styles.selectedSortTab]}
                onPress={() => setSortOption(option.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${option.label} 정렬`}
              >
                <Text style={[styles.sortTabText, isSelected && styles.selectedSortTabText]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.locationRow}>
          <Text style={styles.locationText}>현재 위치 기준 3km 이내</Text>
          <Pressable
            style={({ pressed }) => [styles.locationButton, pressed && styles.pressedButton]}
            onPress={useCurrentLocation}
            disabled={isBusy}
            accessibilityRole="button"
            accessibilityLabel="내 위치 다시 찾기"
          >
            <Ionicons name="locate" size={17} color={COLORS.primary} />
            <Text style={styles.locationButtonText}>내 위치</Text>
          </Pressable>
        </View>

        <View style={styles.keywordSearch}>
          <TextInput
            value={searchInput}
            onChangeText={(value) => { setSearchInput(value); setSearchMessage(''); }}
            onSubmitEditing={submitSearch}
            placeholder="주변 장소명·주소·유형 검색"
            placeholderTextColor="#999999"
            returnKeyType="search"
            style={styles.keywordInput}
            editable={places.length > 0}
            accessibilityLabel="주변 관광지 검색어"
          />
          {searchInput || appliedQuery ? (
            <Pressable
              style={styles.clearButton}
              onPress={resetSearch}
              accessibilityRole="button"
              accessibilityLabel="검색 초기화"
            >
              <Ionicons name="close-circle" size={20} color="#9A94AE" />
            </Pressable>
          ) : null}
          <Pressable
            style={({ pressed }) => [styles.keywordButton, pressed && styles.pressedButton]}
            onPress={submitSearch}
            disabled={places.length === 0}
            accessibilityRole="button"
            accessibilityLabel="주변 관광지 검색"
          >
            <Text style={styles.keywordButtonText}>검색</Text>
          </Pressable>
        </View>

        <Text style={[styles.locationInfo, searchMessage && styles.searchError]}>
          {searchMessage || notice || getLocationInfoText(loadState, regionLabel)}
        </Text>

        <LocationStateBox
          state={loadState}
          onRequestPermission={useCurrentLocation}
          onOpenSettings={() => { void Linking.openSettings().catch(() => undefined); }}
          onRetry={() => void loadNearby({ requestPermission: true, force: true })}
        />

        <View style={styles.mapBox}>
          <NearbyMap
            origin={coordinates}
            markers={markerData}
            selectedPlaceId={selectedPlaceId}
            recenterKey={recenterKey}
            onSelectPlace={setSelectedPlaceId}
            onOpenPlace={openPlaceById}
            onMapError={() => setMapError(true)}
          />
        </View>
        {mapError ? (
          <Text style={styles.mapErrorText}>지도 표시에는 문제가 있지만 관광지 목록은 계속 이용할 수 있어요.</Text>
        ) : null}

        <View style={styles.placeListHeader}>
          <Text style={styles.placeListTitle}>
            {appliedQuery ? '주변 검색 결과' : '주변 관광지'}
          </Text>
          <Text style={styles.placeListCount}>{visiblePlaces.length}곳</Text>
        </View>

        <NearbyListState
          state={loadState}
          hasPlaces={places.length > 0}
          hasVisiblePlaces={visiblePlaces.length > 0}
          isSearching={Boolean(appliedQuery)}
          onRetry={() => void loadNearby({ requestPermission: true, force: true })}
          onResetSearch={resetSearch}
        />

        {visiblePlaces.length > 0 ? (
          <View style={styles.placeList}>
            {visiblePlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                selected={place.id === selectedPlaceId}
                onSelect={() => openPlace(place)}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function getLocationInfoText(state: LoadState, regionLabel: string) {
  if (state === 'ready' || state === 'empty') return `${regionLabel}의 실제 관광정보를 표시하고 있어요.`;
  if (state === 'loading-places') return '현재 위치 반경 3km의 관광정보를 불러오고 있어요.';
  if (state === 'locating') return '배터리 사용을 고려한 정확도로 현재 위치를 확인하고 있어요.';
  return '위치 권한은 주변 관광지를 찾을 때만 사용해요.';
}

function LocationStateBox({
  state,
  onRequestPermission,
  onOpenSettings,
  onRetry,
}: {
  state: LoadState;
  onRequestPermission: () => void;
  onOpenSettings: () => void;
  onRetry: () => void;
}) {
  if (state === 'permission-required' || state === 'permission-denied') {
    return (
      <StateBox
        icon="navigate-circle-outline"
        title={state === 'permission-denied' ? '위치 권한이 허용되지 않았어요' : '현재 위치 사용이 필요해요'}
        description="반경 3km 안의 실제 관광지를 찾기 위해 앱을 사용하는 동안의 위치 권한이 필요해요. 위치는 백그라운드에서 추적하거나 Firebase에 저장하지 않아요."
        buttonLabel={state === 'permission-denied' ? '권한 다시 요청' : '위치 권한 요청'}
        onPress={onRequestPermission}
      />
    );
  }
  if (state === 'permission-blocked') {
    return <StateBox icon="settings-outline" title="기기 설정에서 위치 권한을 켜주세요" description="위치 권한 요청이 차단되어 있어요. 설정에서 Trip-Buddy의 위치 권한을 ‘앱을 사용하는 동안’으로 변경해주세요." buttonLabel="기기 설정 열기" onPress={onOpenSettings} />;
  }
  if (state === 'services-disabled') {
    return <StateBox icon="location-outline" title="위치 서비스가 꺼져 있어요" description="기기의 위치 서비스를 켠 뒤 다시 시도해주세요." buttonLabel="기기 설정 열기" onPress={onOpenSettings} />;
  }
  if (state === 'location-timeout') {
    return <StateBox icon="time-outline" title="위치 확인 시간이 초과됐어요" description="실외나 창가에서 위치 서비스 상태를 확인한 뒤 다시 시도해주세요." buttonLabel="다시 시도" onPress={onRetry} />;
  }
  if (state === 'location-unavailable' || state === 'location-error') {
    return <StateBox icon="warning-outline" title="현재 좌표를 확인하지 못했어요" description="네트워크와 위치 서비스 상태를 확인한 뒤 다시 시도해주세요." buttonLabel="다시 시도" onPress={onRetry} />;
  }
  return null;
}

function NearbyListState({
  state,
  hasPlaces,
  hasVisiblePlaces,
  isSearching,
  onRetry,
  onResetSearch,
}: {
  state: LoadState;
  hasPlaces: boolean;
  hasVisiblePlaces: boolean;
  isSearching: boolean;
  onRetry: () => void;
  onResetSearch: () => void;
}) {
  if (state === 'loading-places') {
    return <View style={styles.listState}><ActivityIndicator color={COLORS.primary} /><Text style={styles.listStateText}>관광공사 위치기반 관광지를 불러오고 있어요.</Text></View>;
  }
  if (state === 'missing-key') {
    return <StateBox icon="key-outline" title="관광공사 API 키 설정이 필요해요" description="EXPO_PUBLIC_TOUR_API_KEY 환경변수를 확인해주세요." buttonLabel="다시 시도" onPress={onRetry} />;
  }
  if (state === 'api-error' && !hasPlaces) {
    return <StateBox icon="cloud-offline-outline" title="주변 관광지를 불러오지 못했어요" description="관광공사 API 또는 네트워크 상태를 확인한 뒤 다시 시도해주세요." buttonLabel="다시 시도" onPress={onRetry} />;
  }
  if (state === 'empty') {
    return <StateBox icon="map-outline" title="3km 안에 제공된 관광지가 없어요" description="가짜 장소를 대신 표시하지 않아요. 위치를 갱신하거나 다른 장소에서 다시 확인해주세요." buttonLabel="위치 새로고침" onPress={onRetry} />;
  }
  if (hasPlaces && !hasVisiblePlaces && isSearching) {
    return <StateBox icon="search-outline" title="주변 검색 결과가 없어요" description="현재 받아온 3km 이내 관광지에서 다른 장소명, 주소, 유형으로 검색해보세요." buttonLabel="검색 초기화" onPress={onResetSearch} />;
  }
  return null;
}

function StateBox({
  icon,
  title,
  description,
  buttonLabel,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  buttonLabel: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.stateBox}>
      <Ionicons name={icon} size={30} color="#8E83B7" />
      <View style={styles.stateBody}>
        <Text style={styles.stateTitle}>{title}</Text>
        <Text style={styles.stateDescription}>{description}</Text>
        <Pressable style={styles.stateButton} onPress={onPress} accessibilityRole="button" accessibilityLabel={buttonLabel}>
          <Text style={styles.stateButtonText}>{buttonLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PlaceCard({
  place,
  selected,
  onSelect,
}: {
  place: NearbyPlace;
  selected: boolean;
  onSelect: () => void;
}) {
  const category = TOUR_CONTENT_TYPE_LABELS[place.contentTypeId] ?? '관광정보';
  return (
    <Pressable
      style={({ pressed }) => [styles.placeCard, selected && styles.selectedPlaceCard, pressed && styles.pressedCard]}
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityLabel={`${place.title}, ${category}, ${formatDistance(place.distanceMeters)}, 상세 보기`}
    >
      {place.image ? (
        <Image source={{ uri: place.image }} style={styles.placeImage} />
      ) : (
        <View style={[styles.placeImage, styles.noImage]}>
          <Ionicons name="image-outline" size={26} color="#A9A1C2" />
          <Text style={styles.noImageText}>이미지 없음</Text>
        </View>
      )}
      <View style={styles.placeContent}>
        <Text style={styles.placeCategory}>{category}</Text>
        <Text style={styles.placeTitle} numberOfLines={2}>{place.title}</Text>
        <Text style={styles.placeAddress} numberOfLines={2}>{place.address}</Text>
        <View style={styles.placeMetaRow}>
          <Ionicons name="location" size={13} color={COLORS.primary} />
          <Text style={styles.placeMeta}>{formatDistance(place.distanceMeters)}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#B5AECF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 38 },
  regionButton: { maxWidth: '100%', minHeight: 40, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, paddingRight: 8 },
  regionText: { flexShrink: 1, color: COLORS.text, fontSize: 15, fontWeight: '700' },
  screenTitle: { marginTop: 10, marginBottom: 18, color: COLORS.primaryDark, fontSize: 24, fontWeight: '800' },
  sortTabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 14 },
  sortTab: { minHeight: 40, justifyContent: 'center', paddingVertical: 9, paddingHorizontal: 17, borderRadius: 20, backgroundColor: COLORS.primaryLight },
  selectedSortTab: { backgroundColor: COLORS.selectedTab },
  sortTabText: { color: COLORS.secondaryText, fontSize: 13 },
  selectedSortTabText: { color: COLORS.primary, fontWeight: '700' },
  locationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 },
  locationText: { flexShrink: 1, color: COLORS.secondaryText, fontSize: 13 },
  locationButton: { minWidth: 74, minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  locationButtonText: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
  keywordSearch: { minHeight: 50, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, backgroundColor: COLORS.background },
  keywordInput: { flex: 1, minWidth: 0, paddingHorizontal: 13, paddingVertical: 10, color: COLORS.text, fontSize: 13 },
  clearButton: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  keywordButton: { minWidth: 54, minHeight: 40, marginRight: 5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, borderRadius: 10, backgroundColor: COLORS.primary },
  keywordButtonText: { color: COLORS.background, fontSize: 12, fontWeight: '700' },
  locationInfo: { marginTop: 9, marginBottom: 12, color: COLORS.secondaryText, fontSize: 12, lineHeight: 18 },
  searchError: { color: COLORS.danger },
  mapBox: { height: 220, overflow: 'hidden', marginBottom: 18, borderRadius: 18, backgroundColor: '#F3F1FC' },
  mapErrorText: { marginTop: -10, marginBottom: 16, color: COLORS.secondaryText, fontSize: 11, lineHeight: 17 },
  placeListHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 2 },
  placeListTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  placeListCount: { color: COLORS.secondaryText, fontSize: 12 },
  placeList: { marginTop: 4 },
  placeCard: { minHeight: 104, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: COLORS.border, borderRadius: 12 },
  selectedPlaceCard: { paddingHorizontal: 9, borderBottomColor: COLORS.selectedTab, backgroundColor: COLORS.surface },
  placeImage: { width: 92, height: 78, borderRadius: 12, backgroundColor: COLORS.primaryLight },
  noImage: { alignItems: 'center', justifyContent: 'center' },
  noImageText: { marginTop: 4, color: '#8E87A8', fontSize: 10, fontWeight: '700' },
  placeContent: { flex: 1, minWidth: 0, justifyContent: 'center' },
  placeCategory: { marginBottom: 3, color: COLORS.primary, fontSize: 10, fontWeight: '800' },
  placeTitle: { marginBottom: 4, color: COLORS.text, fontSize: 15, lineHeight: 20, fontWeight: '700' },
  placeAddress: { marginBottom: 6, color: COLORS.secondaryText, fontSize: 11, lineHeight: 16 },
  placeMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  placeMeta: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  stateBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16, padding: 16, borderRadius: 16, backgroundColor: COLORS.surface },
  stateBody: { flex: 1 },
  stateTitle: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  stateDescription: { marginTop: 5, color: COLORS.secondaryText, fontSize: 12, lineHeight: 18 },
  stateButton: { minHeight: 40, alignSelf: 'flex-start', justifyContent: 'center', marginTop: 11, paddingHorizontal: 14, borderRadius: 12, backgroundColor: COLORS.primary },
  stateButtonText: { color: COLORS.background, fontSize: 12, fontWeight: '800' },
  listState: { minHeight: 130, alignItems: 'center', justifyContent: 'center', gap: 10 },
  listStateText: { color: COLORS.secondaryText, fontSize: 12 },
  pressedButton: { opacity: 0.7 },
  pressedCard: { opacity: 0.72 },
});
