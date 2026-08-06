import type { Mascot, TravelRecord } from '@/src/types/travel';

export const REGION_NAMES = [
  '서울특별시',
  '부산광역시',
  '대구광역시',
  '인천광역시',
  '광주광역시',
  '대전광역시',
  '울산광역시',
  '세종특별자치시',
  '경기도',
  '강원특별자치도',
  '충청북도',
  '충청남도',
  '전북특별자치도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주특별자치도',
] as const;

export const RECORD_REGION_OPTIONS = [
  '서울특별시',
  '경기도',
  '부산광역시',
  '제주특별자치도',
  '강원특별자치도',
  '충청북도',
  '충청남도',
  '전북특별자치도',
  '전라남도',
  '경상북도',
  '경상남도',
  '대구광역시',
  '광주광역시',
  '인천광역시',
  '대전광역시',
  '울산광역시',
  '세종특별자치시',
];

export const MASCOT_DATA: Mascot[] = [
  { region: '서울특별시', shortName: '서울', icon: '🐯', name: '서울 호랑이' },
  { region: '부산광역시', shortName: '부산', icon: '🐦', name: '부산 갈매기' },
  { region: '대구광역시', shortName: '대구', icon: '🦁', name: '대구 사자' },
  { region: '인천광역시', shortName: '인천', icon: '✈️', name: '인천 여행새' },
  { region: '광주광역시', shortName: '광주', icon: '🦋', name: '광주 나비' },
  { region: '대전광역시', shortName: '대전', icon: '🌙', name: '대전 꿈별이' },
  { region: '울산광역시', shortName: '울산', icon: '🐋', name: '울산 고래' },
  { region: '세종특별자치시', shortName: '세종', icon: '📚', name: '세종 책곰' },
  { region: '경기도', shortName: '경기', icon: '🐻', name: '경기 곰' },
  { region: '강원특별자치도', shortName: '강원', icon: '🐐', name: '강원 산양' },
  { region: '충청북도', shortName: '충북', icon: '🍎', name: '충북 사과곰' },
  { region: '충청남도', shortName: '충남', icon: '🦭', name: '충남 바다표범' },
  { region: '전북특별자치도', shortName: '전북', icon: '🐇', name: '전북 들토끼' },
  { region: '전라남도', shortName: '전남', icon: '🐙', name: '전남 문어' },
  { region: '경상북도', shortName: '경북', icon: '🦊', name: '경북 여우' },
  { region: '경상남도', shortName: '경남', icon: '🐢', name: '경남 거북이' },
  { region: '제주특별자치도', shortName: '제주', icon: '🗿', name: '제주 돌하르방' },
];

export function normalizeRegionName(region: string) {
  const aliases: Record<string, string> = {
    서울: '서울특별시',
    부산: '부산광역시',
    대구: '대구광역시',
    인천: '인천광역시',
    광주: '광주광역시',
    대전: '대전광역시',
    울산: '울산광역시',
    세종: '세종특별자치시',
    경기: '경기도',
    강원: '강원특별자치도',
    충북: '충청북도',
    충남: '충청남도',
    전북: '전북특별자치도',
    전남: '전라남도',
    경북: '경상북도',
    경남: '경상남도',
    제주: '제주특별자치도',
  };

  return aliases[region] ?? region;
}

export function getVisitedRegions(records: TravelRecord[]) {
  return [...new Set(records.map((record) => normalizeRegionName(record.region)))];
}

export function getRegionRecords(records: TravelRecord[], region: string) {
  const normalized = normalizeRegionName(region);
  return records
    .filter((record) => normalizeRegionName(record.region) === normalized)
    .sort((first, second) => second.startDate.localeCompare(first.startDate));
}

export function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function formatDateId(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function displayDate(dateId: string) {
  return dateId.replaceAll('-', '.');
}

export function createRecordId() {
  return `record-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
