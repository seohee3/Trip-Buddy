const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const values = new Map();
const storage = {
  getItem: async key => values.get(key) ?? null,
  setItem: async (key, value) => { values.set(key, value); },
  multiGet: async keys => keys.map(key => [key, values.get(key) ?? null]),
  multiSet: async pairs => { for (const [key, value] of pairs) values.set(key, value); },
};
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...args) {
  return resolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, ...args);
};
const load = Module._load;
Module._load = function(request, ...args) {
  return request === '@react-native-async-storage/async-storage'
    ? { __esModule: true, default: storage } : load.call(this, request, ...args);
};
require.extensions['.ts'] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, filename);
const repo = require('../src/storage/travelStorage.ts');
const favorites = require('../src/storage/favoritePlaces.ts');
async function main() {
  const profile = { name: 'QA', bio: '', image: '' };
  const recordA = { ...repo.DEFAULT_RECORDS[0], id: 'private-a', isPublic: false };
  const recordB = { ...repo.DEFAULT_RECORDS[1], id: 'private-b', isPublic: false };
  const placeA = { id:'place-a',title:'A',areaName:'',sigunguName:'',address:'',category:'',image:'',rating:'',distance:'' };
  for (const key of ['@trip-buddy/travel-records','@trip-buddy/favorite-places','TRIP_BUDDY_FAVORITE_PLACES']) {
    values.set(key, JSON.stringify([recordA]));
  }
  const legacy = new Map(values);
  assert.deepEqual((await repo.loadTravelData('A',profile)).records, []);
  assert.deepEqual((await repo.loadTravelData('B',profile)).records, []);
  assert.deepEqual(await favorites.getFavoritePlaces('B'), []);
  await repo.persistRecords('A',[recordA]);
  await repo.persistRecords('B',[recordB]);
  assert.equal((await repo.loadTravelData('A',profile)).records[0].id, 'private-a');
  assert.equal((await repo.loadTravelData('B',profile)).records[0].id, 'private-b');
  await repo.persistRecords('A',[]);
  assert.equal((await repo.loadTravelData('B',profile)).records[0].id, 'private-b');
  await favorites.addFavoritePlace('A',placeA);
  assert.equal(await favorites.isFavoritePlace('A','place-a'), true);
  assert.equal(await favorites.isFavoritePlace('B','place-a'), false);
  await favorites.removeFavoritePlace('B','place-a');
  assert.equal(await favorites.isFavoritePlace('A','place-a'), true);
  await repo.persistFavorites('A',[]);
  assert.deepEqual((await repo.loadTravelData('B',profile)).favorites, []);
  for(const [key,value] of legacy) assert.equal(values.get(key),value,'Legacy data must not be deleted or assigned to another user');
  await assert.rejects(repo.persistRecords('',[]));
  await assert.rejects(repo.persistFavorites('',[]));
  await assert.rejects(favorites.addFavoritePlace('',placeA));
  await assert.rejects(favorites.getFavoritePlaces(''));
  assert.notEqual(repo.userStorageKey('key','a/b'),repo.userStorageKey('key','a%2Fb'));
  console.log('PASS: account A/B record and favorite isolation, reload, delete isolation, signed-out rejection, legacy preservation, UID key collisions');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
