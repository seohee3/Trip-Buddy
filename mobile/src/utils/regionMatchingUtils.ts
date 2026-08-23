import {
  getFullRegionName,
  getRegionByCode,
  REGIONS,
  type RegionArea,
  type RegionSigungu,
} from '@/src/data/regions';

export type RegionRecordLike = {
  areaCode?: unknown;
  areaName?: unknown;
  sigunguCode?: unknown;
  sigunguName?: unknown;
  fullRegionName?: unknown;
  region?: unknown;
  address?: unknown;
  addressName?: unknown;
  roadAddress?: unknown;
  roadAddressName?: unknown;
  addr1?: unknown;
  location?: unknown;
  placeAddress?: unknown;
};

export type ResolvedRegionSelection = {
  area: RegionArea;
  sigungu: RegionSigungu;
  fullRegionName: string;
};

const AREA_ALIASES: Record<string, readonly string[]> = {
  '1': ['서울특별시', '서울시', '서울'],
  '2': ['인천광역시', '인천시', '인천'],
  '3': ['대전광역시', '대전시', '대전'],
  '4': ['대구광역시', '대구시', '대구'],
  '5': ['광주광역시', '광주'],
  '6': ['부산광역시', '부산시', '부산'],
  '7': ['울산광역시', '울산시', '울산'],
  '8': ['세종특별자치시', '세종시', '세종'],
  '31': ['경기도', '경기'],
  '32': ['강원특별자치도', '강원도', '강원'],
  '33': ['충청북도', '충북'],
  '34': ['충청남도', '충남'],
  '35': ['전북특별자치도', '전라북도', '전북'],
  '36': ['전라남도', '전남'],
  '37': ['경상북도', '경북'],
  '38': ['경상남도', '경남'],
  '39': ['제주특별자치도', '제주도', '제주'],
};

const REGION_TEXT_FIELDS: (keyof RegionRecordLike)[] = [
  'fullRegionName',
  'region',
  'address',
  'addressName',
  'roadAddress',
  'roadAddressName',
  'addr1',
  'location',
  'placeAddress',
];

function asNonEmptyText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function normalizeRegionText(value: string) {
  return value
    .normalize('NFKC')
    .replace(/[()[\]{}<>]/g, ' ')
    .replace(/[·,;:/\\|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSigunguAliases(sigunguName: string) {
  const suffixless = sigunguName.replace(/[시군구]$/, '');
  return suffixless.length >= 2 && suffixless !== sigunguName
    ? [sigunguName, suffixless]
    : [sigunguName];
}

function createSelection(area: RegionArea, sigungu: RegionSigungu): ResolvedRegionSelection {
  return {
    area,
    sigungu,
    fullRegionName: getFullRegionName(area.name, sigungu.name),
  };
}

function getSelectionBySigunguCode(sigunguCode: string) {
  for (const area of REGIONS) {
    const sigungu = area.sigungus.find((item) => item.code === sigunguCode);
    if (sigungu) return createSelection(area, sigungu);
  }

  return undefined;
}

function getAreaByAlias(value: string) {
  const normalized = normalizeRegionText(value);
  return REGIONS.find((area) => AREA_ALIASES[area.code]?.includes(normalized));
}

function findAreasInText(value: string) {
  const normalized = normalizeRegionText(value);
  const tokens = normalized.split(' ').filter(Boolean);
  const compact = normalized.replaceAll(' ', '').replace(/^대한민국/, '');

  return REGIONS.filter((area) => {
    const aliases = AREA_ALIASES[area.code] ?? [area.name];
    return aliases.some((alias) => {
      if (tokens.includes(alias)) return true;
      if (!compact.startsWith(alias)) return false;

      const remainder = compact.slice(alias.length);
      return area.sigungus.some((sigungu) =>
        getSigunguAliases(sigungu.name).some((sigunguAlias) => remainder.startsWith(sigunguAlias)),
      );
    });
  });
}

function findSigungusInText(value: string, areas: RegionArea[]) {
  const normalized = normalizeRegionText(value);
  const tokens = normalized.split(' ').filter(Boolean);
  const compact = normalized.replaceAll(' ', '').replace(/^대한민국/, '');
  const matches: ResolvedRegionSelection[] = [];

  for (const area of areas) {
    const areaAliases = [...(AREA_ALIASES[area.code] ?? [area.name])]
      .sort((first, second) => second.length - first.length);
    const compactAfterArea = areaAliases
      .filter((alias) => compact.startsWith(alias))
      .map((alias) => compact.slice(alias.length));

    for (const sigungu of area.sigungus) {
      const aliases = getSigunguAliases(sigungu.name);
      const tokenMatch = aliases.some((alias) => tokens.includes(alias));
      const compactMatch = compactAfterArea.some((remainder) =>
        aliases.some((alias) => remainder.startsWith(alias)),
      );

      if (tokenMatch || compactMatch) matches.push(createSelection(area, sigungu));
    }
  }

  return matches;
}

function uniqueSelection(selections: ResolvedRegionSelection[]) {
  const unique = selections.filter(
    (selection, index) => selections.findIndex(
      (item) => item.area.code === selection.area.code && item.sigungu.code === selection.sigungu.code,
    ) === index,
  );
  return unique.length === 1 ? unique[0] : undefined;
}

/**
 * 표준 코드, 명시적인 시·도/시·군·구, 지역·주소 문자열 순으로 228개 지역을 해석합니다.
 * 동명 시·군·구는 상위 시·도가 없으면 매칭하지 않습니다.
 */
export function resolveRegionSelection(value: RegionRecordLike | string) {
  if (typeof value === 'string') return resolveRegionText(value);

  const areaCode = asNonEmptyText(value.areaCode);
  const sigunguCode = asNonEmptyText(value.sigunguCode);
  const codedSelection = sigunguCode ? getSelectionBySigunguCode(sigunguCode) : undefined;

  if (codedSelection) {
    const explicitArea = areaCode ? getRegionByCode(areaCode) : undefined;
    if (!explicitArea || codedSelection.area.code === explicitArea.code) return codedSelection;

    // 서로 충돌하는 유효 표준 코드는 이름으로 덮어 추정하지 않습니다.
    return undefined;
  }

  const codedArea = areaCode ? getRegionByCode(areaCode) : undefined;
  const sigunguName = asNonEmptyText(value.sigunguName);
  if (codedArea && sigunguName) {
    const match = uniqueSelection(findSigungusInText(sigunguName, [codedArea]));
    if (match) return match;
  }

  const areaName = asNonEmptyText(value.areaName);
  const namedArea = areaName ? getAreaByAlias(areaName) : undefined;
  if (namedArea && sigunguName) {
    const match = uniqueSelection(findSigungusInText(sigunguName, [namedArea]));
    if (match) return match;
  }

  if (areaName && sigunguName) {
    const combinedMatch = resolveRegionText(`${areaName} ${sigunguName}`);
    if (combinedMatch) return combinedMatch;
  }

  for (const field of REGION_TEXT_FIELDS) {
    const text = asNonEmptyText(value[field]);
    if (!text) continue;
    const match = resolveRegionText(text);
    if (match) return match;
  }

  return undefined;
}

export function resolveRegionText(value: string) {
  const normalized = normalizeRegionText(value);
  if (!normalized) return undefined;

  const areas = findAreasInText(normalized);
  if (areas.length > 0) {
    return uniqueSelection(findSigungusInText(normalized, areas));
  }

  // 상위 시·도가 없는 이름은 전국에서 단 하나의 시·군·구일 때만 허용합니다.
  return uniqueSelection(findSigungusInText(normalized, REGIONS));
}
