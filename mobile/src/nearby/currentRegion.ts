import type { TourPlace } from '../api/tourApi.ts';
import { getFullRegionName, getRegionByCode, type RegionArea } from '../data/regions.ts';
import {
  resolveRegionSelection,
  type ResolvedRegionSelection,
} from '../utils/regionMatchingUtils.ts';

export type GeocodedAddressLike = {
  city?: string | null;
  district?: string | null;
  subregion?: string | null;
  region?: string | null;
  formattedAddress?: string | null;
  name?: string | null;
};

const ROMANIZED_AREA_ALIASES: Readonly<Record<string, readonly string[]>> = {
  '1': ['seoul', 'seoul-si', 'seoul special city'],
  '2': ['incheon', 'incheon-si', 'incheon metropolitan city'],
  '3': ['daejeon', 'daejeon-si', 'daejeon metropolitan city'],
  '4': ['daegu', 'daegu-si', 'daegu metropolitan city'],
  '5': ['gwangju', 'gwangju-si', 'gwangju metropolitan city'],
  '6': ['busan', 'busan-si', 'busan metropolitan city'],
  '7': ['ulsan', 'ulsan-si', 'ulsan metropolitan city'],
  '8': ['sejong', 'sejong-si', 'sejong special self-governing city'],
  '31': ['gyeonggi', 'gyeonggi-do', 'gyeonggi province'],
  '32': ['gangwon', 'gangwon-do', 'gangwon special self-governing province'],
  '33': ['chungcheongbuk', 'chungcheongbuk-do', 'north chungcheong'],
  '34': ['chungcheongnam', 'chungcheongnam-do', 'south chungcheong'],
  '35': ['jeonbuk', 'jeollabuk-do', 'north jeolla'],
  '36': ['jeonnam', 'jeollanam-do', 'south jeolla'],
  '37': ['gyeongsangbuk', 'gyeongsangbuk-do', 'north gyeongsang'],
  '38': ['gyeongsangnam', 'gyeongsangnam-do', 'south gyeongsang'],
  '39': ['jeju', 'jeju-do', 'jeju special self-governing province'],
};

const ROMANIZED_SIGUNGU_ALIASES: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  '1': {
    'jongno': '종로구', 'jongno-gu': '종로구',
    'jung': '중구', 'jung-gu': '중구',
    'gangnam': '강남구', 'gangnam-gu': '강남구',
    'mapo': '마포구', 'mapo-gu': '마포구',
    'songpa': '송파구', 'songpa-gu': '송파구',
  },
  '6': {
    'haeundae': '해운대구', 'haeundae-gu': '해운대구',
    'suyeong': '수영구', 'suyeong-gu': '수영구',
    'gijang': '기장군', 'gijang-gun': '기장군',
  },
  '8': { 'sejong': '세종시', 'sejong-si': '세종시' },
  '31': {
    'suwon': '수원시', 'suwon-si': '수원시',
    'seongnam': '성남시', 'seongnam-si': '성남시',
    'yongin': '용인시', 'yongin-si': '용인시',
    'goyang': '고양시', 'goyang-si': '고양시',
  },
  '33': { 'jincheon': '진천군', 'jincheon-gun': '진천군' },
  '39': {
    'jeju': '제주시', 'jeju-si': '제주시',
    'seogwipo': '서귀포시', 'seogwipo-si': '서귀포시',
  },
};

function normalizeRomanized(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[’']/g, '')
    .replace(/[^a-zA-Z-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function toSelection(area: RegionArea, sigunguName: string) {
  const sigungu = area.sigungus.find((item) => item.name === sigunguName);
  if (!sigungu) return undefined;
  return { area, sigungu, fullRegionName: getFullRegionName(area.name, sigungu.name) };
}

export function normalizeGeocodedRegion(
  address: GeocodedAddressLike | null | undefined,
): ResolvedRegionSelection | undefined {
  if (!address) return undefined;

  const fields = [
    address.formattedAddress,
    address.region,
    address.city,
    address.subregion,
    address.district,
    address.name,
  ].filter((value): value is string => Boolean(value?.trim()));

  const koreanSelection = resolveRegionSelection(fields.join(' '));
  if (koreanSelection) return koreanSelection;

  const romanizedFields = fields.map(normalizeRomanized).filter(Boolean);
  const areaEntry = Object.entries(ROMANIZED_AREA_ALIASES).find(([, aliases]) =>
    aliases.some((alias) => romanizedFields.some((field) =>
      field === alias || field.split(' ').includes(alias) || field.startsWith(`${alias} `),
    )),
  );
  if (!areaEntry) return undefined;

  const area = getRegionByCode(areaEntry[0]);
  if (!area) return undefined;
  const sigunguAliases = ROMANIZED_SIGUNGU_ALIASES[area.code] ?? {};
  const sigunguEntry = Object.entries(sigunguAliases).find(([alias]) =>
    romanizedFields.some((field) =>
      field === alias || field.split(' ').includes(alias) || field.startsWith(`${alias} `),
    ),
  );
  if (sigunguEntry) return toSelection(area, sigunguEntry[1]);
  if (area.sigungus.length === 1) return toSelection(area, area.sigungus[0].name);
  return undefined;
}

export function normalizeTourPlaceRegion(place: Pick<
  TourPlace,
  'address' | 'areaCode' | 'sigunguCode' | 'areaName' | 'sigunguName'
>) {
  const addressSelection = resolveRegionSelection({
    areaCode: place.areaCode,
    areaName: place.areaName,
    sigunguName: place.sigunguName,
    address: place.address,
  });
  if (addressSelection) return addressSelection;
  // TourAPI 시군구 코드는 앱의 기존 228개 저장 코드와 체계가 다릅니다.
  // 주소 없이 숫자 순서만으로 추정하면 다른 지역을 표시할 수 있으므로 안전하게 실패합니다.
  return undefined;
}
