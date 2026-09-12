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
