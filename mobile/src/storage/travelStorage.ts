import AsyncStorage from '@react-native-async-storage/async-storage';
import { findRegionSelection, getFullRegionName } from '@/src/data/regions';
import type { FavoritePlace, TravelRecord, UserProfile } from '@/src/types/travel';

const PROFILE_KEY = '@trip-buddy/profile';
const RECORDS_KEY = '@trip-buddy/travel-records';
const FAVORITES_KEY = '@trip-buddy/favorite-places';

export const DEFAULT_PROFILE: UserProfile = {
  name: '남지',
  bio: '여행을 좋아하는 남지',
  image:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
};

export const DEFAULT_RECORDS: TravelRecord[] = [
  {
    id: 'seed-gyeonggi',
    region: '경기도 수원시',
    areaCode: '31',
    areaName: '경기도',
    sigunguCode: '31-001',
    sigunguName: '수원시',
    fullRegionName: '경기도 수원시',
    date: '2026.07.09 ~ 2026.07.10',
    startDate: '2026-07-09',
    endDate: '2026-07-10',
    title: '경기도 광주 여행',
    content: '화담숲, 도자기공원, 칼국수 먹음',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    ],
    isPublic: true,
    createdAt: '2026-07-10T09:00:00.000Z',
  },
  {
    id: 'seed-jeju',
    region: '제주특별자치도 제주시',
    areaCode: '39',
    areaName: '제주특별자치도',
    sigunguCode: '39-001',
    sigunguName: '제주시',
    fullRegionName: '제주특별자치도 제주시',
    date: '2026.06.27 ~ 2026.06.30',
    startDate: '2026-06-27',
    endDate: '2026-06-30',
    title: '제주도 여행',
    content: '푸른 바다 제주도 너무 좋았어요',
    images: [
      'https://images.unsplash.com/photo-1549893072-4bc678117f45?auto=format&fit=crop&w=1200&q=80',
    ],
    isPublic: true,
    createdAt: '2026-06-30T09:00:00.000Z',
  },
];

type StoredData = {
  profile: UserProfile;
  records: TravelRecord[];
  favorites: FavoritePlace[];
};

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

type LegacyTravelRecord = Partial<TravelRecord> & {
  region?: string;
};

/** 기존 area 단위 기록을 공통 지역 모델로 보완합니다. 알 수 없는 문자열도 원문을 보존합니다. */
export function migrateTravelRecord(value: unknown, index: number): TravelRecord | null {
  if (!value || typeof value !== 'object') return null;

  const raw = value as LegacyTravelRecord;
  const legacyRegion = raw.fullRegionName ?? raw.region ?? raw.areaName ?? '';
  const selection = findRegionSelection(legacyRegion);
  const areaCode = raw.areaCode ?? selection?.area.code ?? '';
  const areaName = raw.areaName ?? selection?.area.name ?? legacyRegion;
  const sigungu = selection?.sigungu;
  const sigunguCode = raw.sigunguCode ?? sigungu?.code ?? '';
  const sigunguName = raw.sigunguName ?? sigungu?.name ?? '';
  const fullRegionName = raw.fullRegionName ?? getFullRegionName(areaName, sigunguName) ?? legacyRegion;

  if (!raw.id && !raw.title) return null;

  return {
    id: raw.id ?? `migrated-record-${index}`,
    region: fullRegionName,
    areaCode,
    areaName,
    sigunguCode,
    sigunguName,
    fullRegionName,
    date: raw.date ?? '',
    startDate: raw.startDate ?? '',
    endDate: raw.endDate ?? raw.startDate ?? '',
    title: raw.title ?? '여행 기록',
    content: raw.content ?? '',
    images: Array.isArray(raw.images) ? raw.images.filter((image): image is string => typeof image === 'string') : [],
    isPublic: raw.isPublic ?? true,
    createdAt: raw.createdAt ?? new Date(0).toISOString(),
  };
}

export function migrateTravelRecords(value: unknown): TravelRecord[] {
  if (!Array.isArray(value)) return DEFAULT_RECORDS;
  return value.map(migrateTravelRecord).filter((record): record is TravelRecord => record !== null);
}

export async function loadTravelData(): Promise<StoredData> {
  const storedValues = await AsyncStorage.multiGet([
    PROFILE_KEY,
    RECORDS_KEY,
    FAVORITES_KEY,
  ]);

  const storedData = storedValues.reduce<Record<string, string | null>>(
    (result, [key, value]) => {
      result[key] = value;
      return result;
    },
    {},
  );

  const profileValue = storedData[PROFILE_KEY] ?? null;
  const recordsValue = storedData[RECORDS_KEY] ?? null;
  const favoritesValue = storedData[FAVORITES_KEY] ?? null;

  const profile = parseJson(profileValue, DEFAULT_PROFILE);
  const storedRecords = parseJson<unknown>(recordsValue, DEFAULT_RECORDS);
  const records = migrateTravelRecords(storedRecords);
  const favorites = parseJson(favoritesValue, [] as FavoritePlace[]);

  const writes: Promise<void>[] = [];
  if (!profileValue) writes.push(AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile)));
  if (!recordsValue || JSON.stringify(records) !== JSON.stringify(storedRecords)) {
    writes.push(AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(records)));
  }
  if (!favoritesValue) writes.push(AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)));
  await Promise.all(writes);

  return { profile, records, favorites };
}

export async function persistProfile(profile: UserProfile) {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function persistRecords(records: TravelRecord[]) {
  await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export async function persistFavorites(favorites: FavoritePlace[]) {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}
