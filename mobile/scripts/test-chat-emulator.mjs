// Local emulator only. Uses the installed client SDK and the actual chat repository.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initializeApp, deleteApp } from 'firebase/app';
import {
  connectFirestoreEmulator, getFirestore, doc, setDoc, getDoc, getDocs,
  collection, serverTimestamp, updateDoc, deleteDoc, terminate, setLogLevel,
} from 'firebase/firestore';
import ts from 'typescript';

setLogLevel('silent');
const apps = [];
function client(uid, name = uid || 'anonymous') {
  const app = initializeApp({ projectId: 'demo-trip-buddy-chat', apiKey: 'emulator-only' }, `${name}-${apps.length}`);
  const db = getFirestore(app);
  connectFirestoreEmulator(db, '127.0.0.1', 8088, uid ? { mockUserToken: uid === 'owner' ? 'owner' : { sub: uid } } : {});
  apps.push({ app, db });
  return db;
}
const alice = client('alice');
const bob = client('bob');
const stranger = client('stranger');
const anonymous = client(null);
const admin = client('owner');
let source = readFileSync(new URL('../src/firebase/chatRepository.ts', import.meta.url), 'utf8');
source = source.replace("import { getFirebaseFirestore } from '@/src/firebase/app';", 'const getFirebaseFirestore = () => globalThis.__tripBuddyChatTestDb;');
source = source.replace("'@/src/firebase/chatIdentity'", JSON.stringify(new URL('../src/firebase/chatIdentity.ts', import.meta.url).href));
source = source.replace("'firebase/firestore'", JSON.stringify(import.meta.resolve('firebase/firestore')));
const javascript = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const repo = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`);
const use = (db) => { globalThis.__tripBuddyChatTestDb = db; };
const denied = (operation) => assert.rejects(operation, (error) => error.code === 'permission-denied');
const timeout = setTimeout(() => { console.error('FAIL: emulator test timed out'); process.exit(1); }, 120000);
try {
  await setDoc(doc(alice, 'users', 'alice'), { name: 'A' });
  await setDoc(doc(bob, 'users', 'bob'), { name: 'B' });
  await setDoc(doc(admin, 'mates', 'review-a'), { name: 'A', userId: 'alice' });
  await setDoc(doc(admin, 'mates', 'review-b'), { name: 'B', userId: 'bob' });
  await setDoc(doc(admin, 'mates', 'demo'), { name: 'Demo' });
  use(alice);
  await assert.rejects(repo.openMateChat('alice', 'demo'), /계정이 연결되지/);
  await assert.rejects(repo.openMateChat('alice', 'review-a'), /내 프로필/);
  const fromAlice = repo.openMateChat('alice', 'review-b');
  use(bob);
  const fromBob = repo.openMateChat('bob', 'review-a');
  const [roomA, roomB] = await Promise.all([fromAlice, fromBob]);
  assert.equal(roomA, roomB);
  use(alice);
  await repo.sendChatMessage(roomA, 'alice', '안녕하세요');
  use(bob);
  const realtime = new Promise((resolve, reject) => {
    const unsubscribe = repo.subscribeChat(roomB, (messages) => {
      if (messages.length === 2 && messages.every((message) => !message.pending)) {
        unsubscribe();
        resolve(messages);
      }
    }, reject);
  });
  await repo.sendChatMessage(roomB, 'bob', '반갑습니다');
  const messages = await realtime;
  assert.deepEqual(messages.map((message) => message.senderId), ['alice', 'bob']);
  assert.ok(messages.every((message) => typeof message.createdAt === 'number'));
  const restarted = client('alice', 'restarted');
  const restored = await getDocs(collection(restarted, 'chatRooms', roomA, 'messages'));
  assert.equal(restored.size, 2);
  await denied(() => getDocs(collection(stranger, 'chatRooms', roomA, 'messages')));
  await denied(() => getDoc(doc(stranger, 'chatRooms', roomA)));
  await denied(() => getDocs(collection(anonymous, 'chatRooms', roomA, 'messages')));
  const messagePath = ['chatRooms', roomA, 'messages', 'invalid'];
  for (const data of [
    { senderId: 'bob', text: 'spoof', createdAt: serverTimestamp() },
    { senderId: 'alice', text: '', createdAt: serverTimestamp() },
    { senderId: 'alice', text: 'x'.repeat(2001), createdAt: serverTimestamp() },
    { senderId: 'alice', text: 'time', createdAt: new Date(0) },
    { senderId: 'alice', text: 'extra', createdAt: serverTimestamp(), extra: true },
  ]) await denied(() => setDoc(doc(alice, ...messagePath), data));
  await denied(() => setDoc(doc(stranger, ...messagePath), { senderId: 'stranger', text: 'intrusion', createdAt: serverTimestamp() }));
  await denied(() => updateDoc(doc(alice, 'chatRooms', roomA), { participants: ['alice', 'stranger'] }));
  await denied(() => deleteDoc(doc(alice, 'chatRooms', roomA, 'messages', messages[0].id)));
  await denied(() => setDoc(doc(alice, 'chatRooms', 'alice:missing'), { participants: ['alice', 'missing'], createdAt: serverTimestamp() }));
  await setDoc(doc(stranger, 'users', 'stranger'), { name: 'C' });
  await denied(() => setDoc(doc(stranger, 'chatRooms', 'alice:bob-new'), { participants: ['alice', 'stranger'], createdAt: serverTimestamp() }));
  await denied(() => getDoc(doc(alice, 'users', 'bob')));
  console.log('PASS: real repository room creation race, two-way realtime chat, reconnect persistence, demo/self rejection, participant rules, sender/time/size validation, profile privacy');
} finally {
  clearTimeout(timeout);
  await Promise.all(apps.map(async ({ app, db }) => { await terminate(db); await deleteApp(app); }));
  delete globalThis.__tripBuddyChatTestDb;
}
