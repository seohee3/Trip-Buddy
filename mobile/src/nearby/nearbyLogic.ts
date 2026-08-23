import type { TourPlace } from '../api/tourApi.ts';

export const NEARBY_RADIUS_METERS = 3000;
export const NEARBY_MAX_RESULTS = 50;

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type NearbySortOption = 'recommendation' | 'distance' | 'name';

export type NearbyTravelPreference = {
  contentTypeIds: readonly string[];
  tags: readonly string[];
};

export type NearbyPlace = TourPlace & {
  latitude?: number;
  longitude?: number;
  distanceMeters: number;
  sourceIndex: number;
};

export type NearbyMarkerData = {
  id: string;
  title: string;
  category: string;
  distanceLabel: string;
  latitude: number;
  longitude: number;
};

export const TOUR_CONTENT_TYPE_LABELS: Readonly<Record<string, string>> = {
  '12': '관광지',
  '14': '문화시설',
  '15': '축제/행사',
  '25': '여행코스',
  '28': '레포츠',
  '32': '숙박',
  '38': '쇼핑',
  '39': '음식점',
};

function finiteNumber(value: unknown) {
  if (value === '' || value == null) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function isValidCoordinates(value: Coordinates | null | undefined): value is Coordinates {
  return Boolean(
    value
    && Number.isFinite(value.latitude)
    && Number.isFinite(value.longitude)
    && value.latitude >= -90
    && value.latitude <= 90
    && value.longitude >= -180
    && value.longitude <= 180,
  );
}

export function buildLocationRequestValues(
  coordinates: Coordinates,
  radius = NEARBY_RADIUS_METERS,
) {
  if (!isValidCoordinates(coordinates) || !Number.isFinite(radius) || radius < 1 || radius > 20000) {
    throw new Error('위치기반 요청 좌표 또는 반경이 올바르지 않습니다.');
  }

  return {
    mapX: coordinates.longitude,
    mapY: coordinates.latitude,
    radius: Math.round(radius),
    arrange: 'E' as const,
  };
}

export function calculateHaversineDistance(
  from: Coordinates,
  to: Coordinates,
) {
  if (!isValidCoordinates(from) || !isValidCoordinates(to)) return Number.NaN;

  const earthRadiusMeters = 6371008.8;
  const toRadians = (degree: number) => degree * (Math.PI / 180);
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const firstLatitude = toRadians(from.latitude);
  const secondLatitude = toRadians(to.latitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function deduplicateNearbyPlaces<T extends { id: string }>(places: readonly T[]) {
  const seen = new Set<string>();
  return places.filter((place) => {
    if (!place.id || seen.has(place.id)) return false;
    seen.add(place.id);
    return true;
  });
}

export function prepareNearbyPlaces(
  places: readonly TourPlace[],
  origin: Coordinates,
  radius = NEARBY_RADIUS_METERS,
) {
  if (!isValidCoordinates(origin)) return [];

  const normalized = places.flatMap<NearbyPlace>((place, sourceIndex) => {
    const latitude = finiteNumber(place.mapY);
    const longitude = finiteNumber(place.mapX);
    const apiDistance = finiteNumber(place.distanceMeters);
    const calculatedDistance = latitude !== undefined && longitude !== undefined
      ? calculateHaversineDistance(origin, { latitude, longitude })
      : Number.NaN;
    const distanceMeters = apiDistance !== undefined && apiDistance >= 0
      ? apiDistance
      : calculatedDistance;

    // 좌표나 공식 dist가 없으면 3km 안이라는 사실을 검증할 수 없으므로 표시하지 않습니다.
    if (!Number.isFinite(distanceMeters) || distanceMeters < 0 || distanceMeters > radius) return [];

    return [{
      ...place,
      latitude,
      longitude,
      distanceMeters,
      sourceIndex,
    }];
  });

  return deduplicateNearbyPlaces(normalized).slice(0, NEARBY_MAX_RESULTS);
}

export function formatDistance(distanceMeters: number) {
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0) return '';
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)}m`;
  return `${(distanceMeters / 1000).toFixed(1)}km`;
}

export function filterNearbyPlaces(places: readonly NearbyPlace[], rawQuery: string) {
  const query = rawQuery.trim().toLocaleLowerCase('ko-KR');
  if (!query) return [...places];

  return places.filter((place) => [
    place.title,
    place.address,
    place.areaName,
    place.sigunguName,
    TOUR_CONTENT_TYPE_LABELS[place.contentTypeId] ?? '관광정보',
  ].some((field) => field.toLocaleLowerCase('ko-KR').includes(query)));
}

export function getNearbyRecommendationScore(
  place: NearbyPlace,
  preference?: NearbyTravelPreference | null,
) {
  if (!preference) return 0;

  const contentPriority = preference.contentTypeIds.indexOf(place.contentTypeId);
  const contentTypeScore = contentPriority >= 0 ? 100 - contentPriority * 5 : 0;
  const searchableText = `${place.title} ${place.address}`.toLocaleLowerCase('ko-KR');
  const tagScore = preference.tags.reduce(
    (score, tag) => score + (searchableText.includes(tag.toLocaleLowerCase('ko-KR')) ? 10 : 0),
    0,
  );
  return contentTypeScore + tagScore;
}

export function sortNearbyPlaces(
  places: readonly NearbyPlace[],
  sortOption: NearbySortOption,
  preference?: NearbyTravelPreference | null,
) {
  return [...places].sort((left, right) => {
    if (sortOption === 'name') {
      return left.title.localeCompare(right.title, 'ko-KR')
        || left.distanceMeters - right.distanceMeters
        || left.sourceIndex - right.sourceIndex;
    }

    if (sortOption === 'recommendation' && preference) {
      const scoreDifference = getNearbyRecommendationScore(right, preference)
        - getNearbyRecommendationScore(left, preference);
      if (scoreDifference) return scoreDifference;
    }

    return left.distanceMeters - right.distanceMeters
      || left.sourceIndex - right.sourceIndex
      || left.id.localeCompare(right.id);
  });
}

export function createNearbyMarkerData(places: readonly NearbyPlace[]): NearbyMarkerData[] {
  return places.flatMap((place) => {
    if (place.latitude === undefined || place.longitude === undefined) return [];
    if (!isValidCoordinates({ latitude: place.latitude, longitude: place.longitude })) return [];

    return [{
      id: place.id,
      title: place.title,
      category: TOUR_CONTENT_TYPE_LABELS[place.contentTypeId] ?? '관광정보',
      distanceLabel: formatDistance(place.distanceMeters),
      latitude: place.latitude,
      longitude: place.longitude,
    }];
  });
}
