import assert from 'node:assert/strict';
import fs from 'node:fs';

import { getTravelSurveyDraftKey, getTravelTypeCacheKey } from '../src/travel-type/cacheKeys.ts';
import { TRAVEL_TYPE_CATALOG } from '../src/travel-type/catalog.ts';
import { requestTourPlaces } from '../src/api/tourApi.ts';
import { buildTravelTypeFirestorePayload, hasUndefinedDeep } from '../src/travel-type/persistence.ts';
import { TRAVEL_SURVEY_QUESTIONS } from '../src/travel-type/questions.ts';
import {
  buildTourRecommendationStages,
  deduplicateTourPlaces,
  loadTourRecommendations,
  recommendMates,
} from '../src/travel-type/recommendations.ts';
import { resolveAppAccess } from '../src/travel-type/routing.ts';
import { calculateTravelTypeResult } from '../src/travel-type/scoring.ts';

assert.equal(TRAVEL_SURVEY_QUESTIONS.length, 12, '설문은 정확히 12문항이어야 합니다.');
for (const axis of ['PS', 'AR', 'LH', 'TI']) {
  assert.equal(TRAVEL_SURVEY_QUESTIONS.filter((question) => question.axis === axis).length, 3, `${axis} 축은 3문항이어야 합니다.`);
}
for (let index = 1; index < TRAVEL_SURVEY_QUESTIONS.length; index += 1) {
  assert.notEqual(TRAVEL_SURVEY_QUESTIONS[index - 1].axis, TRAVEL_SURVEY_QUESTIONS[index].axis, '같은 축이 연속되면 안 됩니다.');
}

const codes = new Set(TRAVEL_TYPE_CATALOG.map((type) => type.code));
const names = new Set(TRAVEL_TYPE_CATALOG.map((type) => type.name));
assert.equal(codes.size, 16, '여행유형 코드는 16개여야 합니다.');
assert.equal(names.size, 16, '여행유형 이름은 모두 고유해야 합니다.');

const generatedCodes = new Set();
for (let mask = 0; mask < 2 ** TRAVEL_SURVEY_QUESTIONS.length; mask += 1) {
  const answers = Object.fromEntries(TRAVEL_SURVEY_QUESTIONS.map((question, index) => [
    question.id,
    question.options[(mask >> index) & 1].value,
  ]));
  const result = calculateTravelTypeResult(answers);
  assert.ok(result, `답변 조합 ${mask}는 유효한 결과를 만들어야 합니다.`);
  generatedCodes.add(result.code);
  for (const score of Object.values(result.axisScores)) {
    assert.equal(score.leftScore + score.rightScore, 3, '각 축은 세 답변이어야 합니다.');
    assert.notEqual(score.leftScore, score.rightScore, '축 결과는 동점이면 안 됩니다.');
    assert.ok([33, 67, 0, 100].includes(score.leftPercent), '비율은 3문항 기준이어야 합니다.');
  }
}
assert.deepEqual(generatedCodes, codes, '모든 답변 조합에서 정확히 16개 코드가 나와야 합니다.');

assert.notEqual(getTravelTypeCacheKey('user-a'), getTravelTypeCacheKey('user-b'));
assert.notEqual(getTravelSurveyDraftKey('user-a'), getTravelSurveyDraftKey('user-b'));
assert.match(getTravelTypeCacheKey('user-a'), /user-a$/);
assert.match(getTravelSurveyDraftKey('user-a'), /user-a$/);

const sampleAnswers = Object.fromEntries(TRAVEL_SURVEY_QUESTIONS.map((question) => [question.id, question.options[0].value]));
const sampleResult = calculateTravelTypeResult(sampleAnswers);
assert.ok(sampleResult);
const payload = buildTravelTypeFirestorePayload(sampleResult, sampleAnswers, 'SERVER_TIMESTAMP');
assert.equal(payload.onboardingCompleted, true);
assert.equal(hasUndefinedDeep(payload), false, 'Firestore payload에 undefined가 있으면 안 됩니다.');
const payloadWithUnexpectedInput = buildTravelTypeFirestorePayload(
  sampleResult,
  { ...sampleAnswers, unexpected: undefined },
  'SERVER_TIMESTAMP',
);
assert.equal(Object.keys(payloadWithUnexpectedInput.travelSurveyAnswers).length, 12);
assert.equal(hasUndefinedDeep(payloadWithUnexpectedInput), false, '예상 밖 입력도 Firestore payload에서 제거해야 합니다.');

const mates = [
  { id: 'b', name: 'B', age: 20, region: '서울', match: 90, image: 'https://example.com/b', sub: '', isActive: true, updatedAt: null, travelTypeCode: 'SRHI' },
  { id: 'a', name: 'A', age: 20, region: '서울', match: 90, image: 'https://example.com/a', sub: '', isActive: true, updatedAt: null, travelTypeCode: sampleResult.code },
  { id: 'c', name: 'C', age: 20, region: '서울', match: 50, image: 'https://example.com/c', sub: '', isActive: true, updatedAt: null },
];
const mateRecommendations = recommendMates(mates, sampleResult, 3);
assert.equal(mateRecommendations[0].mate.id, 'a', '성향이 같은 메이트가 우선이어야 합니다.');
assert.deepEqual(
  mateRecommendations.map((item) => item.personalizedMatch),
  [...mateRecommendations].map((item) => item.personalizedMatch).sort((a, b) => b - a),
  '메이트 적합도는 내림차순이어야 합니다.',
);
assert.equal(mates[0].match, 90, '원본 match는 변경하면 안 됩니다.');
const stableTie = recommendMates([
  { ...mates[1], id: 'b' },
  { ...mates[1], id: 'a' },
], sampleResult, 2);
assert.deepEqual(stableTie.map((item) => item.mate.id), ['a', 'b'], '동점은 문서 ID 순으로 안정 정렬해야 합니다.');

const places = [
  { id: '1', title: '첫 장소', address: '서울', contentTypeId: '12' },
  { id: '1', title: '중복 장소', address: '서울', contentTypeId: '14' },
  { id: '2', title: '둘째 장소', address: '부산', contentTypeId: '14' },
];
assert.deepEqual(deduplicateTourPlaces(places).map((place) => place.id), ['1', '2']);

const pahtDefinition = TRAVEL_TYPE_CATALOG.find((type) => type.code === 'PAHT');
assert.ok(pahtDefinition);
const pahtStages = buildTourRecommendationStages(pahtDefinition);
assert.deepEqual(
  pahtStages[0].map(({ endpoint, keyword, contentTypeId, stage }) => ({ endpoint, keyword, contentTypeId, stage })),
  [
    { endpoint: 'searchKeyword2', keyword: '로컬', contentTypeId: '25', stage: 1 },
    { endpoint: 'searchKeyword2', keyword: '골목', contentTypeId: '25', stage: 1 },
    { endpoint: 'searchKeyword2', keyword: '체험', contentTypeId: '28', stage: 1 },
  ],
);
assert.deepEqual(pahtStages[2].map((query) => query.keyword), ['마을', '레포츠']);
assert.ok(pahtStages[3].every((query) => query.endpoint === 'areaBasedList2'));

const apiSuccess = (mockPlaces) => ({ places: mockPlaces, summary: { resultCode: '0000' } });
const mockPlace = (id) => ({ id, title: `장소 ${id}`, address: '실제 API 주소', contentTypeId: '12' });

const stageTwoCalls = [];
const stageTwoFallback = await loadTourRecommendations(
  pahtDefinition,
  async (query) => {
    stageTwoCalls.push(query);
    return apiSuccess(query.stage === 2 ? [mockPlace('stage-2')] : []);
  },
  { targetCount: 1 },
);
assert.equal(stageTwoFallback.status, 'success');
assert.deepEqual(stageTwoCalls.map((query) => query.stage), [1, 1, 1, 2], '1단계가 비면 2단계를 실행해야 합니다.');

const areaFallbackCalls = [];
const areaFallback = await loadTourRecommendations(
  pahtDefinition,
  async (query) => {
    areaFallbackCalls.push(query);
    return apiSuccess(query.endpoint === 'areaBasedList2' ? [mockPlace('area-list')] : []);
  },
  { targetCount: 1 },
);
assert.equal(areaFallback.status, 'success');
assert.ok(areaFallbackCalls.some((query) => query.stage === 4), '키워드 검색이 모두 비면 목록 endpoint를 실행해야 합니다.');
assert.equal(areaFallback.places[0].recommendationSource.endpoint, 'areaBasedList2');

const partialResult = await loadTourRecommendations(
  pahtDefinition,
  async (query) => {
    if (query.stage === 1 && query.keyword === '골목') throw new Error('mock failure');
    if (query.stage === 1) return apiSuccess([mockPlace(query.keyword)]);
    return apiSuccess([]);
  },
  { targetCount: 2 },
);
assert.equal(partialResult.status, 'success');
assert.equal(partialResult.places.length, 2, '일부 요청 오류가 있어도 성공 장소를 유지해야 합니다.');
assert.equal(partialResult.errorCount, 1);

const manyPlaces = Array.from({ length: 16 }, (_, index) => mockPlace(String(index % 15)));
const limitedResult = await loadTourRecommendations(
  pahtDefinition,
  async () => apiSuccess(manyPlaces),
);
assert.equal(limitedResult.places.length, 12, '추천 결과는 최대 12개여야 합니다.');
assert.equal(new Set(limitedResult.places.map((place) => place.id)).size, 12, 'contentId 중복을 제거해야 합니다.');

const emptyResult = await loadTourRecommendations(
  pahtDefinition,
  async () => apiSuccess([]),
);
assert.equal(emptyResult.status, 'empty');
assert.deepEqual(emptyResult.places, [], '실제 응답이 없으면 가짜 카드를 만들면 안 됩니다.');
assert.ok(emptyResult.requestCount <= 10, '추천 API 호출 수는 상한을 지켜야 합니다.');

const fakeApiKey = 'must-not-appear-in-result';
const missingKeyResult = await loadTourRecommendations(
  pahtDefinition,
  async () => {
    throw Object.assign(new Error(`secret ${fakeApiKey}`), { kind: 'missing-key' });
  },
);
assert.equal(missingKeyResult.status, 'missing-key');
assert.equal(JSON.stringify(missingKeyResult).includes(fakeApiKey), false, 'API 키가 결과나 오류에 포함되면 안 됩니다.');

const originalFetch = globalThis.fetch;
const originalTourKey = process.env.EXPO_PUBLIC_TOUR_API_KEY;
let capturedRequestUrl = '';
try {
  process.env.EXPO_PUBLIC_TOUR_API_KEY = fakeApiKey;
  globalThis.fetch = async (url) => {
    capturedRequestUrl = String(url);
    return {
      ok: true,
      json: async () => ({
        response: {
          header: { resultCode: '0000' },
          body: { totalCount: 0, items: '' },
        },
      }),
    };
  };
  const parsedEmptyResponse = await requestTourPlaces({
    endpoint: 'searchKeyword2',
    keyword: '로컬',
    contentTypeId: '25',
    pageNo: 1,
    numOfRows: 10,
  });
  assert.equal(parsedEmptyResponse.summary.resultCode, '0000');
  assert.equal(parsedEmptyResponse.summary.totalCount, 0);
  assert.equal(parsedEmptyResponse.summary.itemsStructure, 'empty');
  assert.deepEqual(parsedEmptyResponse.places, []);
  const sanitizedSummary = JSON.stringify(parsedEmptyResponse.summary);
  assert.equal(sanitizedSummary.includes(fakeApiKey), false);
  assert.equal(capturedRequestUrl.includes(fakeApiKey), true, '실제 요청에는 API 키가 필요합니다.');
} finally {
  globalThis.fetch = originalFetch;
  if (originalTourKey === undefined) delete process.env.EXPO_PUBLIC_TOUR_API_KEY;
  else process.env.EXPO_PUBLIC_TOUR_API_KEY = originalTourKey;
}

assert.equal(resolveAppAccess(false, false, false, false), 'loading');
assert.equal(resolveAppAccess(true, false, true, false), 'auth');
assert.equal(resolveAppAccess(true, true, false, false), 'loading');
assert.equal(resolveAppAccess(true, true, true, false), 'survey', '신규 사용자는 설문으로 진입해야 합니다.');
assert.equal(resolveAppAccess(true, true, true, true), 'app', '완료 사용자는 앱으로 진입해야 합니다.');

const contextSource = fs.readFileSync(new URL('../src/context/TravelTypeContext.tsx', import.meta.url), 'utf8');
const remoteSaveIndex = contextSource.indexOf('await saveRemoteTravelType');
const resultCommitIndex = contextSource.indexOf('setTravelType(result)');
assert.ok(remoteSaveIndex >= 0 && resultCommitIndex > remoteSaveIndex, 'Firestore 성공 전에는 새 결과를 커밋하면 안 됩니다.');
assert.ok(!contextSource.includes('setTravelType(null);\n      await saveRemoteTravelType'), '재검사 중 기존 결과를 지우면 안 됩니다.');

console.log('travel-type tests: 4096 combinations, fallback stages, API parsing and integration invariants passed');
