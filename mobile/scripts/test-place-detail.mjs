import assert from 'node:assert/strict';
import { fetchTourPlaceOverview, normalizeTourOverview } from '../src/api/tourApi.ts';

assert.equal(normalizeTourOverview('<p>첫 문단 &amp; 소개</p><p>둘째<br />줄&nbsp;&#x1F30F; &#39;인용&#39;</p>'), "첫 문단 & 소개\n\n둘째\n줄 🌏 '인용'");
assert.equal(normalizeTourOverview('<style>hidden</style><script>alert(1)</script><b>본문</b>'), '본문');
assert.equal(normalizeTourOverview('&#1114112;&#xD800;<br>&nbsp;'), '');
assert.equal(normalizeTourOverview(null), '');
assert.equal(normalizeTourOverview('본문 &middot; &ldquo;소개&rdquo;'), '본문 · “소개”');

const originalFetch = globalThis.fetch;
const originalKey = process.env.EXPO_PUBLIC_TOUR_API_KEY;
const fakeKey = 'detail-key-must-not-leak';
let body;
let captured;
let capturedSignal;
const controller = new AbortController();
try {
  process.env.EXPO_PUBLIC_TOUR_API_KEY = fakeKey;
  globalThis.fetch = async (url, options) => {
    captured = new URL(url);
    capturedSignal = options.signal;
    return { ok: true, json: async () => ({ response: { header: { resultCode: '0000' }, body } }) };
  };
  for (const item of [
    { contentid: '123', overview: '<p>실제 소개</p>' },
    [{ contentid: 123, overview: '<p>실제 소개</p>' }],
  ]) {
    body = { items: { item } };
    assert.equal(await fetchTourPlaceOverview('123', controller.signal), '실제 소개');
    assert.equal(captured.pathname, '/B551011/KorService2/detailCommon2');
    assert.equal(captured.searchParams.get('contentId'), '123');
    assert.equal(captured.searchParams.has('arrange'), false);
    assert.equal(captured.searchParams.has('overviewYN'), false);
    assert.equal(capturedSignal, controller.signal);
  }
  for (const empty of [
    { items: '' }, { items: { item: [] } },
    { items: { item: { contentid: '123' } } },
    { items: { item: { contentid: '123', overview: '<br>&nbsp;' } } },
    { items: { item: { contentid: 'other', overview: '다른 장소' } } },
  ]) {
    body = empty;
    assert.equal(await fetchTourPlaceOverview('123'), '');
  }
  globalThis.fetch = async () => { throw Error(fakeKey); };
  await assert.rejects(fetchTourPlaceOverview('123'), (error) => error.kind === 'network' && !String(error).includes(fakeKey));
  globalThis.fetch = async () => ({ ok: false });
  await assert.rejects(fetchTourPlaceOverview('123'), (error) => error.kind === 'http');
  globalThis.fetch = async () => ({ ok: true, json: async () => { throw Error('bad JSON'); } });
  await assert.rejects(fetchTourPlaceOverview('123'), (error) => error.kind === 'invalid-response');
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ response: { header: { resultCode: '22' } } }) });
  await assert.rejects(fetchTourPlaceOverview('123'), (error) => error.kind === 'api');
  delete process.env.EXPO_PUBLIC_TOUR_API_KEY;
  await assert.rejects(fetchTourPlaceOverview('123'), (error) => error.kind === 'missing-key');
  assert.equal(await fetchTourPlaceOverview(''), '');
} finally {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.EXPO_PUBLIC_TOUR_API_KEY;
  else process.env.EXPO_PUBLIC_TOUR_API_KEY = originalKey;
}
console.log('place detail tests: endpoint, contentId, HTML, entities, empty responses, failures and key safety passed');
