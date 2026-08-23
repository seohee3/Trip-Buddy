import assert from 'node:assert/strict';
import fs from 'node:fs';

import { requestTourPlaces } from '../src/api/tourApi.ts';
import { normalizeGeocodedRegion, normalizeTourPlaceRegion } from '../src/nearby/currentRegion.ts';
import {
  buildLocationRequestValues,
  calculateHaversineDistance,
  createNearbyMarkerData,
  deduplicateNearbyPlaces,
  filterNearbyPlaces,
  formatDistance,
  prepareNearbyPlaces,
  sortNearbyPlaces,
} from '../src/nearby/nearbyLogic.ts';
import { resolveRegionSelection } from '../src/utils/regionMatchingUtils.ts';

const suwon = { latitude: 37.2636, longitude: 127.0286 };
const requestValues = buildLocationRequestValues(suwon, 3000);
assert.deepEqual(requestValues, {
  mapX: 127.0286,
  mapY: 37.2636,
  radius: 3000,
  arrange: 'E',
});
assert.throws(() => buildLocationRequestValues({ latitude: 95, longitude: 127 }, 3000));
assert.throws(() => buildLocationRequestValues(suwon, 20001));

const oneKilometerNorth = { latitude: suwon.latitude + (1 / 111.195), longitude: suwon.longitude };
const oneKilometerDistance = calculateHaversineDistance(suwon, oneKilometerNorth);
assert.ok(oneKilometerDistance > 990 && oneKilometerDistance < 1010, 'Haversine 거리는 약 1km여야 합니다.');
assert.equal(formatDistance(240.4), '240m');
assert.equal(formatDistance(840), '840m');
assert.equal(formatDistance(1250), '1.3km');

const rawPlaces = [
  {
    id: 'near', title: '수원 문화 공원', areaName: '경기도', sigunguName: '수원시',
    address: '경기도 수원시 팔달구', contentTypeId: '12', image: '',
    mapX: String(suwon.longitude), mapY: String(oneKilometerNorth.latitude),
  },
  {
    id: 'api-dist', title: '체험관', areaName: '경기도', sigunguName: '수원시',
    address: '경기도 수원시 영통구', contentTypeId: '28', image: '',
    mapX: String(suwon.longitude), mapY: String(suwon.latitude), distanceMeters: 450,
  },
  {
    id: 'outside', title: '반경 밖 장소', areaName: '경기도', sigunguName: '용인시',
    address: '경기도 용인시', contentTypeId: '12', image: '',
    mapX: String(suwon.longitude), mapY: String(suwon.latitude + 0.05),
  },
  {
    id: 'unknown-distance', title: '거리 미확인', areaName: '', sigunguName: '',
    address: '주소 정보 없음', contentTypeId: '12', image: '',
  },
  {
    id: 'near', title: '중복 장소', areaName: '경기도', sigunguName: '수원시',
    address: '경기도 수원시', contentTypeId: '14', image: '', distanceMeters: 200,
  },
];

const nearby = prepareNearbyPlaces(rawPlaces, suwon, 3000);
assert.deepEqual(nearby.map((place) => place.id), ['near', 'api-dist'], '3km 반경 밖·거리 미확인·중복 장소를 제거해야 합니다.');
assert.equal(nearby.find((place) => place.id === 'api-dist')?.distanceMeters, 450, '유효한 API dist를 우선 사용해야 합니다.');
assert.deepEqual(deduplicateNearbyPlaces([{ id: 'a' }, { id: 'a' }, { id: 'b' }]).map(({ id }) => id), ['a', 'b']);

const distanceSorted = sortNearbyPlaces(nearby, 'distance');
assert.deepEqual(distanceSorted.map((place) => place.id), ['api-dist', 'near']);
const recommendationSorted = sortNearbyPlaces(nearby, 'recommendation', {
  contentTypeIds: ['12', '28'],
  tags: ['문화'],
});
assert.deepEqual(recommendationSorted.map((place) => place.id), ['near', 'api-dist'], '여행유형 콘텐츠 유형과 실제 제목 태그가 우선이어야 합니다.');
assert.deepEqual(sortNearbyPlaces(nearby, 'recommendation').map((place) => place.id), ['api-dist', 'near'], '여행유형이 없으면 거리 기반으로 안정 정렬해야 합니다.');

assert.deepEqual(filterNearbyPlaces(nearby, '  체험  ').map((place) => place.id), ['api-dist']);
assert.deepEqual(filterNearbyPlaces(nearby, '경기도').map((place) => place.id), ['near', 'api-dist']);
assert.deepEqual(filterNearbyPlaces(nearby, '').map((place) => place.id), ['near', 'api-dist'], '검색 초기화 시 원래 목록을 복원해야 합니다.');

const markers = createNearbyMarkerData(nearby);
assert.equal(markers.length, 2);
assert.deepEqual(markers[0], {
  id: 'near',
  title: '수원 문화 공원',
  category: '관광지',
  distanceLabel: '1.0km',
  latitude: oneKilometerNorth.latitude,
  longitude: suwon.longitude,
});

assert.equal(resolveRegionSelection('경기 수원')?.fullRegionName, '경기도 수원시');
assert.equal(resolveRegionSelection('충북 진천')?.fullRegionName, '충청북도 진천군');
assert.equal(resolveRegionSelection('중구'), undefined, '동명 구는 상위 시도 없이 임의 매칭하면 안 됩니다.');
assert.equal(normalizeGeocodedRegion({ region: '경기', city: '수원' })?.fullRegionName, '경기도 수원시');
assert.equal(normalizeGeocodedRegion({ region: 'Gyeonggi-do', city: 'Suwon-si' })?.fullRegionName, '경기도 수원시');
assert.equal(normalizeGeocodedRegion({ region: 'Busan', district: 'Haeundae-gu' })?.fullRegionName, '부산광역시 해운대구');
assert.equal(normalizeGeocodedRegion({ region: 'Jeju-do', city: 'Seogwipo-si' })?.fullRegionName, '제주특별자치도 서귀포시');
assert.equal(normalizeTourPlaceRegion({
  address: '경기도 수원시 팔달구', areaCode: '31', sigunguCode: '13', areaName: '경기도', sigunguName: '수원시',
})?.fullRegionName, '경기도 수원시');
assert.equal(normalizeTourPlaceRegion({
  address: '', areaCode: '31', sigunguCode: '13', areaName: '', sigunguName: '',
}), undefined, '서로 다른 코드 체계를 숫자 순서만으로 추정하면 안 됩니다.');

const originalFetch = globalThis.fetch;
const originalKey = process.env.EXPO_PUBLIC_TOUR_API_KEY;
const safeFakeKey = 'nearby-secret-must-not-leak';
const responses = [
  { totalCount: 0, items: '' },
  {
    totalCount: 1,
    items: { item: {
      contentid: 'single', contenttypeid: '12', title: '단일 장소', addr1: '경기도 수원시',
      firstimage: '', mapx: '127.0286', mapy: '37.2636', dist: '123.4', areacode: '31', sigungucode: '1',
    } },
  },
  {
    totalCount: 2,
    items: { item: [
      { contentid: 'array-1', contenttypeid: '14', title: '배열 장소 1', addr1: '서울특별시 종로구', mapx: '126.98', mapy: '37.57', dist: '50' },
      { contentid: 'array-2', contenttypeid: '28', title: '배열 장소 2', addr1: '서울특별시 종로구', mapx: '126.981', mapy: '37.571', dist: '' },
    ] },
  },
];
let capturedUrl = '';
try {
  process.env.EXPO_PUBLIC_TOUR_API_KEY = safeFakeKey;
  globalThis.fetch = async (url) => {
    capturedUrl = String(url);
    const body = responses.shift();
    return {
      ok: true,
      json: async () => ({ response: { header: { resultCode: '0000' }, body } }),
    };
  };

  const empty = await requestTourPlaces({
    endpoint: 'locationBasedList2', mapX: suwon.longitude, mapY: suwon.latitude,
    radius: 3000, arrange: 'E', pageNo: 1, numOfRows: 50,
  });
  assert.equal(empty.summary.itemsStructure, 'empty');
  assert.equal(empty.summary.endpoint, 'locationBasedList2');
  assert.equal(empty.summary.arrange, 'E');
  assert.equal(empty.summary.mapX, suwon.longitude);
  assert.equal(empty.summary.mapY, suwon.latitude);
  assert.equal(empty.summary.radius, 3000);
  assert.deepEqual(empty.places, [], '빈 API 응답에서 가짜 카드를 만들면 안 됩니다.');
  const parsedUrl = new URL(capturedUrl);
  assert.equal(parsedUrl.pathname.endsWith('/locationBasedList2'), true);
  assert.equal(parsedUrl.searchParams.get('mapX'), String(suwon.longitude));
  assert.equal(parsedUrl.searchParams.get('mapY'), String(suwon.latitude));
  assert.equal(parsedUrl.searchParams.get('radius'), '3000');
  assert.equal(parsedUrl.searchParams.get('arrange'), 'E');

  const single = await requestTourPlaces({ endpoint: 'searchKeyword2', keyword: '수원' });
  assert.equal(single.summary.itemsStructure, 'single-item');
  assert.equal(single.places[0].distanceMeters, 123.4);
  assert.equal(single.places[0].areaCode, '31');
  assert.equal(single.places[0].sigunguCode, '1');

  const array = await requestTourPlaces({ endpoint: 'areaBasedList2', contentTypeId: '14' });
  assert.equal(array.summary.itemsStructure, 'item-array');
  assert.equal(array.places.length, 2);
  assert.equal(array.places[1].distanceMeters, undefined);
  assert.equal(JSON.stringify([empty.summary, single.summary, array.summary]).includes(safeFakeKey), false);
} finally {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.EXPO_PUBLIC_TOUR_API_KEY;
  else process.env.EXPO_PUBLIC_TOUR_API_KEY = originalKey;
}

try {
  process.env.EXPO_PUBLIC_TOUR_API_KEY = safeFakeKey;
  globalThis.fetch = async () => { throw new Error(`network failed: ${safeFakeKey}`); };
  await assert.rejects(
    requestTourPlaces({ endpoint: 'searchKeyword2', keyword: '수원' }),
    (error) => {
      assert.equal(String(error).includes(safeFakeKey), false, '네트워크 오류 메시지에 API 키가 포함되면 안 됩니다.');
      return true;
    },
  );
} finally {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.EXPO_PUBLIC_TOUR_API_KEY;
  else process.env.EXPO_PUBLIC_TOUR_API_KEY = originalKey;
}

const nearbySource = fs.readFileSync(new URL('../app/(tabs)/nearby.tsx', import.meta.url), 'utf8');
const webMapSource = fs.readFileSync(new URL('../src/components/nearby/NearbyMap.web.tsx', import.meta.url), 'utf8');
const tourApiSource = fs.readFileSync(new URL('../src/api/tourApi.ts', import.meta.url), 'utf8');
const detailSource = fs.readFileSync(new URL('../app/place/[id].tsx', import.meta.url), 'utf8');
assert.equal(nearbySource.includes('SAMPLE_PLACES'), false);
assert.equal(nearbySource.includes('rating'), false, '주변 탭은 확인되지 않은 별점을 표시하면 안 됩니다.');
assert.equal(webMapSource.includes('react-native-maps'), false, '웹 지도 파일은 native map 패키지를 import하면 안 됩니다.');
assert.equal(tourApiSource.includes('console.log'), false, '관광 API가 키가 포함될 수 있는 URL을 로그로 남기면 안 됩니다.');
assert.equal(detailSource.includes('Linking.canOpenURL'), true);
assert.equal(detailSource.includes('https://map.kakao.com/link/map/'), true);
assert.equal([nearbySource, webMapSource, tourApiSource, detailSource].join('').includes(safeFakeKey), false);

console.log('nearby tests: location params, parser shapes, 3km filtering, sorting, regions, markers, search and key safety passed');
