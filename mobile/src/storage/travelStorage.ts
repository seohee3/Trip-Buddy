import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFullRegionName } from '@/src/data/regions';
import type { FavoritePlace, TravelRecord, UserProfile } from '@/src/types/travel';
import {
  resolveRegionSelection,
  type RegionRecordLike,
} from '@/src/utils/regionMatchingUtils';

const LEGACY_PROFILE_KEY = '@trip-buddy/profile';
const PROFILE_MIGRATION_MARKER_KEY = '@trip-buddy/profile-migration-owner';
const USER_PROFILE_KEY_PREFIX = '@trip-buddy/profile/';
const RECORDS_KEY = '@trip-buddy/travel-records';
const FAVORITES_KEY = '@trip-buddy/favorite-places';

// Legacy unscoped keys remain untouched: their owner cannot be established safely.
export function userStorageKey(baseKey: string, uid: string) {
  if (!uid?.trim()) throw new Error('저장된 여행 데이터를 사용하려면 로그인이 필요합니다.');
  return baseKey + '/' + encodeURIComponent(uid);
}

const DEFAULT_PROFILE_IMAGE =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';

export const DEFAULT_PROFILE: UserProfile = {
  name: '남지',
  bio: '여행을 좋아하는 남지',
  image: DEFAULT_PROFILE_IMAGE,
};

export function createDefaultUserProfile(name?: string | null, email?: string | null): UserProfile {
  const emailName = email?.split('@')[0]?.trim() ?? '';

  return {
    name: firstNonEmptyText(name, emailName, '여행자'),
    bio: '소개글이 없습니다.',
    image: DEFAULT_PROFILE_IMAGE,
  };
}

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

function userProfileKey(uid: string) {
  if (!uid) throw new Error('프로필 캐시를 불러오려면 사용자 UID가 필요합니다.');
  return `${USER_PROFILE_KEY_PREFIX}${uid}`;
}

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeStoredProfile(value: unknown, fallback: UserProfile): UserProfile {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback;

  const raw = value as Partial<UserProfile>;
  return {
    name: firstNonEmptyText(raw.name, fallback.name),
    bio: typeof raw.bio === 'string' ? raw.bio : fallback.bio,
    image: typeof raw.image === 'string' ? raw.image : fallback.image,
  };
}

type LegacyTravelRecord = Partial<TravelRecord> & RegionRecordLike;

function firstNonEmptyText(...values: unknown[]) {
  return values.find((value): value is string => typeof value === 'string' && Boolean(value.trim()))?.trim() ?? '';
}

/** 기존 area 단위 기록을 공통 지역 모델로 보완합니다. 알 수 없는 문자열도 원문을 보존합니다. */
export function migrateTravelRecord(value: unknown, index: number): TravelRecord | null {
  if (!value || typeof value !== 'object') return null;

  const raw = value as LegacyTravelRecord;
  const selection = resolveRegionSelection(raw);
  const legacyRegion = firstNonEmptyText(
    raw.fullRegionName,
    raw.region,
    raw.address,
    raw.addressName,
    raw.roadAddress,
    raw.roadAddressName,
    raw.addr1,
    raw.placeAddress,
    raw.areaName,
  );
  const areaCode = selection?.area.code ?? firstNonEmptyText(raw.areaCode);
  const areaName = selection?.area.name ?? firstNonEmptyText(raw.areaName, legacyRegion);
  const sigunguCode = selection?.sigungu.code ?? firstNonEmptyText(raw.sigunguCode);
  const sigunguName = selection?.sigungu.name ?? firstNonEmptyText(raw.sigunguName);
  const fullRegionName = selection?.fullRegionName
    ?? firstNonEmptyText(raw.fullRegionName, raw.region, getFullRegionName(areaName, sigunguName), legacyRegion);

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

export async function loadUserProfile(uid: string, fallback: UserProfile): Promise<UserProfile> {
  const profileKey = userProfileKey(uid);
  const storedValues = await AsyncStorage.multiGet([
    profileKey,
    LEGACY_PROFILE_KEY,
    PROFILE_MIGRATION_MARKER_KEY,
  ]);

  const storedData = storedValues.reduce<Record<string, string | null>>(
    (result, [key, value]) => {
      result[key] = value;
      return result;
    },
    {},
  );

  const cachedValue = storedData[profileKey] ?? null;
  if (cachedValue) {
    return normalizeStoredProfile(parseJson<unknown>(cachedValue, fallback), fallback);
  }

  const legacyValue = storedData[LEGACY_PROFILE_KEY] ?? null;
  const migrationOwner = storedData[PROFILE_MIGRATION_MARKER_KEY] ?? null;
  const shouldMigrateLegacyProfile = Boolean(legacyValue) && !migrationOwner;
  const profile = shouldMigrateLegacyProfile
    ? normalizeStoredProfile(parseJson<unknown>(legacyValue, fallback), fallback)
    : fallback;
  const writes: [string, string][] = [[profileKey, JSON.stringify(profile)]];

  if (shouldMigrateLegacyProfile) {
    writes.push([PROFILE_MIGRATION_MARKER_KEY, uid]);
  }

  await AsyncStorage.multiSet(writes);
  return profile;
}

export async function loadTravelData(uid: string, profileFallback: UserProfile): Promise<StoredData> {
  const recordsKey = userStorageKey(RECORDS_KEY, uid);
  const favoritesKey = userStorageKey(FAVORITES_KEY, uid);
  const [profile, storedValues] = await Promise.all([
    loadUserProfile(uid, profileFallback),
    AsyncStorage.multiGet([recordsKey, favoritesKey]),
  ]);

  const storedData = storedValues.reduce<Record<string, string | null>>(
    (result, [key, value]) => {
      result[key] = value;
      return result;
    },
    {},
  );

  const recordsValue = storedData[recordsKey] ?? null;
  const favoritesValue = storedData[favoritesKey] ?? null;

  const storedRecords = parseJson<unknown>(recordsValue, []);
  const records = Array.isArray(storedRecords) ? migrateTravelRecords(storedRecords) : [];
  const favorites = parseJson(favoritesValue, [] as FavoritePlace[]);

  const writes: Promise<void>[] = [];
  if (!recordsValue || JSON.stringify(records) !== JSON.stringify(storedRecords)) {
    writes.push(AsyncStorage.setItem(recordsKey, JSON.stringify(records)));
  }
  if (!favoritesValue) writes.push(AsyncStorage.setItem(favoritesKey, JSON.stringify(favorites)));
  await Promise.all(writes);

  return { profile, records, favorites };
}

export async function persistProfile(uid: string, profile: UserProfile) {
  await AsyncStorage.setItem(userProfileKey(uid), JSON.stringify(profile));
}

export async function persistRecords(uid: string, records: TravelRecord[]) {
  const recordsKey = userStorageKey(RECORDS_KEY, uid);
  await AsyncStorage.setItem(recordsKey, JSON.stringify(records));
}

export async function persistFavorites(uid: string, favorites: FavoritePlace[]) {
  const favoritesKey = userStorageKey(FAVORITES_KEY, uid);
  await AsyncStorage.setItem(favoritesKey, JSON.stringify(favorites));
}
