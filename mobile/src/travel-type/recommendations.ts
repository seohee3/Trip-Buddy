import type { Mate } from '../types/mate.ts';
import {
  AXIS_LABELS,
  TRAVEL_AXIS_ORDER,
  codeToAxisPreferences,
  type TravelAxis,
  type TravelPole,
  type TravelTypeDefinition,
  type TravelTypeResult,
} from './model.ts';

export const MATE_AXIS_WEIGHT = 0.7;
export const MATE_EXISTING_MATCH_WEIGHT = 0.3;

export type MateRecommendation = {
  mate: Mate;
  axisSimilarity: number;
  personalizedMatch: number;
  reason: string;
};

export type TourRecommendationQuery = {
  endpoint: 'searchKeyword2' | 'areaBasedList2';
  stage: 1 | 2 | 3 | 4;
  keyword?: string;
  contentTypeId?: string;
};

export type TourRecommendationSource = {
  endpoint: TourRecommendationQuery['endpoint'];
  stage: TourRecommendationQuery['stage'];
  keyword: string | null;
  requestedContentTypeId: string | null;
};

export type SourcedTourPlace<T> = T & {
  recommendationSource: TourRecommendationSource;
};

export type TourRecommendationApiResponse<T> = {
  places: T[];
  summary: { resultCode: string };
};

export type TourRecommendationLoadStatus = 'success' | 'empty' | 'error' | 'missing-key';

export type TourRecommendationLoadResult<T> = {
  status: TourRecommendationLoadStatus;
  places: SourcedTourPlace<T>[];
  requestCount: number;
  successfulResponseCount: number;
  errorCount: number;
};

export const TOUR_RECOMMENDATION_TARGET_COUNT = 6;
export const TOUR_RECOMMENDATION_MAX_COUNT = 12;
export const TOUR_RECOMMENDATION_MAX_REQUESTS = 10;

type RecommendationPlace = {
  id: string;
  title: string;
  contentTypeId: string;
  address: string;
  recommendationSource?: TourRecommendationSource;
};

export type RankedTourPlace<T extends RecommendationPlace> = {
  place: T;
  reason: string;
};

function preferencesForMate(mate: Mate): Partial<Record<TravelAxis, TravelPole>> {
  if (mate.axisPreferences) return mate.axisPreferences;
  return mate.travelTypeCode ? codeToAxisPreferences(mate.travelTypeCode) : {};
}

function mateReason(
  userPreferences: Record<TravelAxis, TravelPole>,
  matePreferences: Partial<Record<TravelAxis, TravelPole>>,
) {
  const matchedAxis = TRAVEL_AXIS_ORDER.find(
    (axis) => matePreferences[axis] === userPreferences[axis],
  );
  if (!matchedAxis) return '기존 메이트 정보와 중립 성향을 함께 반영했어요.';

  const [leftLabel, rightLabel] = AXIS_LABELS[matchedAxis];
  const label = userPreferences[matchedAxis] === matchedAxis[0] ? leftLabel : rightLabel;
  const messages: Record<TravelAxis, string> = {
    PS: `${label} 흐름을 편안하게 맞출 수 있어요.`,
    AR: `${label} 일정을 함께 즐기기 좋아요.`,
    LH: `${label} 취향의 장소를 함께 찾기 좋아요.`,
    TI: `${label} 방식이 서로 잘 맞아요.`,
  };
  return messages[matchedAxis];
}

export function recommendMates(
  mates: readonly Mate[],
  travelType: TravelTypeResult,
  limit = 3,
): MateRecommendation[] {
  const userPreferences = codeToAxisPreferences(travelType.code);

  return mates.map((mate) => {
    const matePreferences = preferencesForMate(mate);
    const points = TRAVEL_AXIS_ORDER.reduce((sum, axis) => {
      const preference = matePreferences[axis];
      return sum + (preference ? (preference === userPreferences[axis] ? 1 : 0) : 0.5);
    }, 0);
    const axisSimilarity = Math.round((points / TRAVEL_AXIS_ORDER.length) * 100);
    const personalizedMatch = Math.round(
      axisSimilarity * MATE_AXIS_WEIGHT + mate.match * MATE_EXISTING_MATCH_WEIGHT,
    );
    return {
      mate,
      axisSimilarity,
      personalizedMatch,
      reason: mateReason(userPreferences, matePreferences),
    };
  }).sort((left, right) =>
    right.personalizedMatch - left.personalizedMatch ||
    left.mate.id.localeCompare(right.mate.id, 'ko') ||
    left.mate.name.localeCompare(right.mate.name, 'ko')
  ).slice(0, Math.max(0, limit));
}

export function buildTourRecommendationQueries(
  definition: TravelTypeDefinition,
  limit = 4,
): TourRecommendationQuery[] {
  const queries: TourRecommendationQuery[] = [];
  const count = Math.min(limit, Math.max(definition.tags.length, definition.contentTypeIds.length));

  for (let index = 0; index < count; index += 1) {
    const keyword = definition.tags[index % definition.tags.length];
    const inferredContentTypeId = [
      { pattern: /축제|행사/, contentTypeId: '15' },
      { pattern: /체험|레포츠|액티비티|트레킹|탐방|모험/, contentTypeId: '28' },
      { pattern: /맛집|카페|음식/, contentTypeId: '39' },
      { pattern: /시장|쇼핑/, contentTypeId: '38' },
      { pattern: /전시|문화|박물관|미술관|서점/, contentTypeId: '14' },
      { pattern: /골목|마을|로컬|산책|코스|숨은/, contentTypeId: '25' },
      { pattern: /명소|전망|자연|역사|핫플|비경/, contentTypeId: '12' },
    ].find((rule) => rule.pattern.test(keyword))?.contentTypeId;
    const contentTypeId = inferredContentTypeId && definition.contentTypeIds.includes(inferredContentTypeId)
      ? inferredContentTypeId
      : definition.contentTypeIds[index % definition.contentTypeIds.length];

    queries.push({
      endpoint: 'searchKeyword2',
      stage: 1,
      keyword,
      contentTypeId,
    });
  }
  return queries;
}

function generalFallbackKeywords(definition: TravelTypeDefinition, limit = 2) {
  const code = definition.code;
  const keywordGroups = [
    code[2] === 'H' ? ['마을', '시장', '골목'] : ['관광지', '박물관', '문화'],
    code[1] === 'A' ? ['체험', '레포츠', '트레킹'] : ['공원', '정원', '산책'],
    code[3] === 'T' ? ['축제', '체험'] : ['산책', '미술관', '자연'],
  ];
  const excluded = new Set(definition.tags.map((keyword) => keyword.trim()));
  const selected: string[] = [];

  for (const group of keywordGroups) {
    const keyword = group.find((candidate) => !excluded.has(candidate) && !selected.includes(candidate));
    if (keyword) selected.push(keyword);
    if (selected.length >= limit) break;
  }
  return selected;
}

export function buildTourRecommendationStages(
  definition: TravelTypeDefinition,
): TourRecommendationQuery[][] {
  const stageOne = buildTourRecommendationQueries(definition);
  const stageTwo = definition.tags.map((keyword) => ({
    endpoint: 'searchKeyword2' as const,
    stage: 2 as const,
    keyword,
  }));
  const stageThree = generalFallbackKeywords(definition).map((keyword) => ({
    endpoint: 'searchKeyword2' as const,
    stage: 3 as const,
    keyword,
  }));
  const stageFour = definition.contentTypeIds.map((contentTypeId) => ({
    endpoint: 'areaBasedList2' as const,
    stage: 4 as const,
    contentTypeId,
  }));
  return [stageOne, stageTwo, stageThree, stageFour];
}

function errorKind(error: unknown) {
  if (!error || typeof error !== 'object' || !('kind' in error)) return null;
  return typeof error.kind === 'string' ? error.kind : null;
}

export async function loadTourRecommendations<T extends { id: string }>(
  definition: TravelTypeDefinition,
  requester: (query: TourRecommendationQuery) => Promise<TourRecommendationApiResponse<T>>,
  options: {
    targetCount?: number;
    maxCount?: number;
    maxRequests?: number;
  } = {},
): Promise<TourRecommendationLoadResult<T>> {
  const targetCount = Math.max(1, options.targetCount ?? TOUR_RECOMMENDATION_TARGET_COUNT);
  const maxCount = Math.max(1, options.maxCount ?? TOUR_RECOMMENDATION_MAX_COUNT);
  const maxRequests = Math.max(1, options.maxRequests ?? TOUR_RECOMMENDATION_MAX_REQUESTS);
  const collected: SourcedTourPlace<T>[] = [];
  const seen = new Set<string>();
  let requestCount = 0;
  let successfulResponseCount = 0;
  let errorCount = 0;
  let missingKey = false;

  const addPlaces = (places: T[], query: TourRecommendationQuery) => {
    for (const place of places) {
      if (!place.id || seen.has(place.id)) continue;
      seen.add(place.id);
      collected.push({
        ...place,
        recommendationSource: {
          endpoint: query.endpoint,
          stage: query.stage,
          keyword: query.keyword ?? null,
          requestedContentTypeId: query.contentTypeId ?? null,
        },
      });
      if (collected.length >= maxCount) break;
    }
  };

  const stages = buildTourRecommendationStages(definition);
  for (let stageIndex = 0; stageIndex < stages.length; stageIndex += 1) {
    if (collected.length >= targetCount || requestCount >= maxRequests || missingKey) break;

    for (const query of stages[stageIndex]) {
      if (requestCount >= maxRequests || collected.length >= maxCount || missingKey) break;
      // 1단계는 세 추천 조건을 모두 확인하고, fallback 단계는 목표 개수 도달 즉시 멈춥니다.
      if (stageIndex > 0 && collected.length >= targetCount) break;

      requestCount += 1;
      try {
        const response = await requester(query);
        successfulResponseCount += 1;
        addPlaces(response.places, query);
      } catch (error) {
        errorCount += 1;
        if (errorKind(error) === 'missing-key') missingKey = true;
      }
    }
  }

  const places = collected.slice(0, maxCount);
  const status: TourRecommendationLoadStatus = places.length > 0
    ? 'success'
    : missingKey
      ? 'missing-key'
      : errorCount > 0
        ? 'error'
        : 'empty';

  return { status, places, requestCount, successfulResponseCount, errorCount };
}

export function deduplicateTourPlaces<T extends { id: string }>(places: readonly T[]): T[] {
  const seen = new Set<string>();
  return places.filter((place) => {
    if (!place.id || seen.has(place.id)) return false;
    seen.add(place.id);
    return true;
  });
}

function deterministicNumber(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function placeReason(
  place: RecommendationPlace,
  type: TravelTypeResult,
  definition: TravelTypeDefinition,
) {
  const code = type.code;
  if (definition.contentTypeIds.includes(place.contentTypeId)) {
    return '추천 콘텐츠 유형과 일치해요.';
  }
  if (place.recommendationSource?.keyword) {
    if (code[2] === 'H') return '숨은 장소형 여행 키워드와 연결된 장소예요.';
    if (code[1] === 'A') return '활동형 여행자가 살펴보기 좋은 관광 콘텐츠예요.';
    if (code[1] === 'R') return '휴식형 여행 키워드와 연결된 장소예요.';
    return '여행유형 키워드 검색에서 찾은 관광 콘텐츠예요.';
  }
  return '여행유형의 추천 조건으로 찾은 관광 콘텐츠예요.';
}

export function rankTourRecommendations<T extends RecommendationPlace>(
  places: readonly T[],
  type: TravelTypeResult,
  definition: TravelTypeDefinition,
): RankedTourPlace<T>[] {
  const priority = new Map(definition.contentTypeIds.map((id, index) => [id, index]));
  const deduplicated = deduplicateTourPlaces(places);

  deduplicated.sort((left, right) => {
    if (type.code[0] === 'P') {
      return (priority.get(left.contentTypeId) ?? 99) - (priority.get(right.contentTypeId) ?? 99)
        || left.title.localeCompare(right.title, 'ko')
        || left.id.localeCompare(right.id);
    }
    return deterministicNumber(`${type.code}-${left.id}`) - deterministicNumber(`${type.code}-${right.id}`)
      || left.id.localeCompare(right.id);
  });

  return deduplicated.map((place) => ({
    place,
    reason: placeReason(place, type, definition),
  }));
}
