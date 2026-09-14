const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

const mobileRoot = path.resolve(__dirname, '..');
const originalResolveFilename = Module._resolveFilename;
const originalLoad = Module._load;

Module._resolveFilename = function resolveFilename(request, parent, isMain, options) {
  const resolvedRequest = request.startsWith('@/')
    ? path.join(mobileRoot, request.slice(2))
    : request;
  return originalResolveFilename.call(this, resolvedRequest, parent, isMain, options);
};

Module._load = function loadModule(request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') {
    return {
      __esModule: true,
      default: {
        multiGet: async () => [],
        setItem: async () => undefined,
      },
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};

require.extensions['.ts'] = function compileTypeScript(module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  });
  module._compile(outputText, filename);
};

const { MASCOTS } = require('../src/data/mascots.ts');
const { migrateTravelRecord } = require('../src/storage/travelStorage.ts');
const { recordUnlocksMascot } = require('../src/utils/mascotUnlockUtils.ts');
const {
  resolveRegionSelection,
  resolveRegionText,
} = require('../src/utils/regionMatchingUtils.ts');

function expectRegion(input, areaCode, sigunguCode) {
  const selection = typeof input === 'string'
    ? resolveRegionText(input)
    : resolveRegionSelection(input);

  assert.ok(selection, `${JSON.stringify(input)} 지역을 찾지 못했습니다.`);
  assert.equal(selection.area.code, areaCode);
  assert.equal(selection.sigungu.code, sigunguCode);
}

test('정식·축약 지역명을 같은 표준 코드로 변환한다', () => {
  expectRegion('경기도 수원시', '31', '31-001');
  expectRegion('수원시', '31', '31-001');
  expectRegion('충청북도 진천군', '33', '33-008');
  expectRegion('충북 진천', '33', '33-008');
  expectRegion('울산광역시 울주군', '7', '7-005');
});

test('228개 정식 전체 지역명이 각각 자기 코드로만 변환된다', () => {
  assert.equal(MASCOTS.length, 228);
  for (const mascot of MASCOTS) {
    expectRegion(mascot.regionName, mascot.areaCode, mascot.sigunguCode);
  }
});

test('공백·괄호·도로명 주소에서도 행정구역 조합만 인식한다', () => {
  expectRegion('대한민국경기도수원시팔달구 정조로 825', '31', '31-001');
  expectRegion('충북 진천군 (진천읍) 중앙서로 1', '33', '33-008');
});

test('저장된 표준 지역 코드를 이름보다 우선한다', () => {
  expectRegion({
    areaCode: '33',
    sigunguCode: '33-008',
    areaName: '경기도',
    sigunguName: '수원시',
    fullRegionName: '경기도 수원시',
  }, '33', '33-008');
});

test('코드가 비어 있는 기존 기록은 지역·주소 필드로 복구한다', () => {
  expectRegion({ areaCode: '', sigunguCode: '', region: '충북 진천' }, '33', '33-008');
  expectRegion({ addressName: '울산광역시 울주군 범서읍' }, '7', '7-005');

  const migrated = migrateTravelRecord({
    id: 'stored-jincheon',
    title: '진천 기록',
    areaCode: '',
    sigunguCode: '',
    fullRegionName: '',
    region: '충북 진천',
  }, 0);
  assert.ok(migrated);
  assert.equal(migrated.areaCode, '33');
  assert.equal(migrated.areaName, '충청북도');
  assert.equal(migrated.sigunguCode, '33-008');
  assert.equal(migrated.sigunguName, '진천군');
  assert.equal(migrated.fullRegionName, '충청북도 진천군');
});

test('모호하거나 판별할 수 없는 문자열은 임의 지역으로 연결하지 않는다', () => {
  assert.equal(resolveRegionText('중구'), undefined);
  assert.equal(resolveRegionText('고성'), undefined);
  assert.equal(resolveRegionText('행복한 여름 여행'), undefined);
  assert.equal(resolveRegionSelection({ areaCode: '31', sigunguCode: '33-008' }), undefined);
});

test('도감 해금도 같은 표준 지역 해석 결과를 사용한다', () => {
  const jincheonMascot = MASCOTS.find((mascot) => mascot.sigunguCode === '33-008');
  const suwonMascot = MASCOTS.find((mascot) => mascot.sigunguCode === '31-001');
  assert.ok(jincheonMascot);
  assert.ok(suwonMascot);

  const legacyRecord = {
    id: 'legacy-jincheon',
    region: '충북 진천',
    areaCode: '',
    areaName: '',
    sigunguCode: '',
    sigunguName: '',
    fullRegionName: '',
    date: '2026.08.23',
    startDate: '2026-08-23',
    endDate: '2026-08-23',
    title: '진천 여행',
    content: '',
    images: [],
    isPublic: true,
    createdAt: '2026-08-23T00:00:00.000Z',
  };

  assert.equal(recordUnlocksMascot(legacyRecord, jincheonMascot), true);
  assert.equal(recordUnlocksMascot(legacyRecord, suwonMascot), false);
});

const { getVisibleMascots } = require('../src/utils/mascotBookPresentation.ts');
const { buildMascotCollection } = require('../src/utils/mascotUnlockUtils.ts');
const { getRegionMascotLook } = require('../src/data/regionMascotThemes.ts');

const entry = (index, acquiredDate, isUnlocked = true) => ({
  ...MASCOTS[index], isUnlocked, acquiredDate, relatedRecords: [],
});

test('전체는 수집 우선·최근 획득순이며 동률과 날짜 없는 항목은 지역순이다', () => {
  const collection = [
    entry(0, '2026-01-01'), entry(1, null, false),
    entry(2, '2026-09-14'), entry(3, '2026-09-14'),
    entry(4, null), entry(5, null, false), entry(6, null),
  ];
  const original = structuredClone(collection);
  const ids = indexes => indexes.map(index => MASCOTS[index].id);
  assert.deepEqual(getVisibleMascots(collection, 'all').map(x => x.id), ids([2, 3, 0, 4, 6, 1, 5]));
  assert.deepEqual(getVisibleMascots(collection, 'collected').map(x => x.id), ids([2, 3, 0, 4, 6]));
  assert.deepEqual(getVisibleMascots(collection, 'locked').map(x => x.id), ids([1, 5]));
  assert.deepEqual(collection, original, '표시 정렬은 원본 수집 데이터와 획득일을 변경하지 않는다');
});

test('빈 컬렉션·전부 미해금·전부 수집 상태의 필터가 정확하다', () => {
  for (const filter of ['all', 'collected', 'locked']) assert.deepEqual(getVisibleMascots([], filter), []);
  const locked = MASCOTS.map((_, index) => entry(index, null, false));
  assert.equal(getVisibleMascots(locked, 'collected').length, 0);
  assert.deepEqual(getVisibleMascots(locked, 'locked'), locked);
  const collected = MASCOTS.map((_, index) => entry(index, '2026-09-14'));
  assert.deepEqual(getVisibleMascots(collected, 'all'), collected);
  assert.equal(getVisibleMascots(collected, 'locked').length, 0);
});

test('기록 추가·삭제와 최초 획득일 변화가 표시 필터에 자동 반영된다', () => {
  const record = (index, date, id) => ({
    id, areaCode: MASCOTS[index].areaCode, sigunguCode: MASCOTS[index].sigunguCode,
    startDate: date, date, createdAt: date,
  });
  const older = record(0, '2026-01-01', 'older');
  const newer = record(0, '2026-09-14', 'newer');
  const other = record(1, '2026-08-01', 'other');
  const collection = buildMascotCollection([older, newer, other], MASCOTS);
  assert.equal(collection[0].acquiredDate, '2026-01-01');
  assert.deepEqual(getVisibleMascots(collection, 'collected').map(x => x.id), [MASCOTS[1].id, MASCOTS[0].id]);
  const afterDeletingOldest = buildMascotCollection([newer, other], MASCOTS);
  assert.equal(getVisibleMascots(afterDeletingOldest, 'collected')[0].id, MASCOTS[0].id);
  const afterDeletingRegion = buildMascotCollection([other], MASCOTS);
  assert.equal(getVisibleMascots(afterDeletingRegion, 'collected').length, 1);
  assert.ok(getVisibleMascots(afterDeletingRegion, 'locked').some(x => x.id === MASCOTS[0].id));
});

test('228개 지역의 색상·의상·소품 조합은 결정적이며 지역 데이터는 그대로다', () => {
  assert.equal(MASCOTS.length, 228);
  const pairs = new Set();
  const outfits = new Set();
  const props = new Set();
  for (const mascot of MASCOTS) {
    const look = getRegionMascotLook(mascot.areaCode, mascot.sigunguCode, mascot.sigunguName);
    assert.match(look.primary, /^#[0-9a-f]{6}$/i);
    assert.match(look.secondary, /^#[0-9a-f]{6}$/i);
    assert.notEqual(look.primary, look.secondary);
    assert.deepEqual(look, getRegionMascotLook(mascot.areaCode, mascot.sigunguCode, mascot.sigunguName));
    pairs.add(look.primary + ':' + look.secondary);
    outfits.add(look.outfit);
    props.add(look.prop);
  }
  assert.equal(pairs.size, 228);
  assert.equal(outfits.size, 4);
  assert.equal(props.size, 14);
});
