import assert from 'node:assert/strict';
import { chatRoomId, chatText } from '../src/firebase/chatIdentity.ts';

assert.equal(chatRoomId('alice', 'bob'), chatRoomId('bob', 'alice'));
assert.throws(() => chatRoomId('a:b', 'c'));
assert.throws(() => chatRoomId('a%3Ab', 'c'));
for (const pair of [['a', 'a'], ['', 'b'], [' ', 'b'], ['a/b', 'c'], ['a'.repeat(129), 'b']]) {
  assert.throws(() => chatRoomId(...pair));
}
assert.equal(chatText('  안녕하세요!  '), '안녕하세요!');
assert.equal(chatText('a'.repeat(2000)).length, 2000);
assert.throws(() => chatText(' \n '));
assert.throws(() => chatText('a'.repeat(2001)));
console.log('PASS: chat room symmetry, delimiter collisions, invalid UIDs, message validation');
