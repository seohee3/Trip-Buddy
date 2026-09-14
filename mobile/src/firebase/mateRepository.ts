import { collection, getDocs } from 'firebase/firestore';

import { TRIP_BUDDY_MATES } from '@/src/data/mates';
import { getFirebaseFirestore } from '@/src/firebase/app';
import type { Mate } from '@/src/types/mate';
import {
  AXIS_POLES,
  TRAVEL_AXIS_ORDER,
  isTravelTypeCode,
  type TravelAxis,
  type TravelPole,
} from '@/src/travel-type/model';

const DEFAULT_MATE_IMAGE = TRIP_BUDDY_MATES[0].image;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function textOr(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function numberInRange(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function remoteImageOrDefault(value: unknown) {
  if (typeof value !== 'string') return DEFAULT_MATE_IMAGE;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? value : DEFAULT_MATE_IMAGE;
  } catch {
    return DEFAULT_MATE_IMAGE;
  }
}

function timestampToIso(value: unknown): string | null {
  if (typeof value === 'string') {
    const milliseconds = Date.parse(value);
    return Number.isNaN(milliseconds) ? null : new Date(milliseconds).toISOString();
  }

  if (!value || typeof value !== 'object' || !('toDate' in value) || typeof value.toDate !== 'function') {
    return null;
  }

  try {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date.toISOString() : null;
  } catch {
    return null;
  }
}

function stringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
      .map((item) => item.trim())
      .slice(0, 12)
    : undefined;
}

function axisPreferences(value: unknown): Partial<Record<TravelAxis, TravelPole>> | undefined {
  if (!isRecord(value)) return undefined;
  const result: Partial<Record<TravelAxis, TravelPole>> = {};

  for (const axis of TRAVEL_AXIS_ORDER) {
    const pole = value[axis];
    if (AXIS_POLES[axis].includes(pole as TravelPole)) result[axis] = pole as TravelPole;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

export function normalizeMateDocument(id: string, value: unknown): Mate {
  const data = isRecord(value) ? value : {};

  return {
    id,
    name: textOr(data.name, '트립 메이트'),
    age: numberInRange(data.age, 20, 1, 120),
    region: textOr(data.region, '지역 미정'),
    match: numberInRange(data.match, 0, 0, 100),
    image: remoteImageOrDefault(data.image),
    sub: textOr(data.sub, '함께 여행할 메이트예요'),
    isActive: typeof data.isActive === 'boolean' ? data.isActive : false,
    updatedAt: timestampToIso(data.updatedAt),
    travelTypeCode: isTravelTypeCode(data.travelTypeCode) ? data.travelTypeCode : undefined,
    travelTags: stringList(data.travelTags),
    axisPreferences: axisPreferences(data.axisPreferences),
  };
}

export async function fetchMatesFromFirestore(uid: string): Promise<Mate[]> {
  if (!uid) throw new Error('메이트 목록을 불러오려면 로그인이 필요합니다.');

  const firestore = getFirebaseFirestore();
  const snapshot = await getDocs(collection(firestore, 'mates'));

  return snapshot.docs
    .filter((mateDocument) => mateDocument.data().userId !== uid)
    .map((mateDocument) => normalizeMateDocument(mateDocument.id, mateDocument.data()))
    .sort((left, right) => right.match - left.match);
}
