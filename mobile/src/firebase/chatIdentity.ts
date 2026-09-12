/** Firebase email/password UIDs use this alphabet; colon separates the pair unambiguously. */
export function chatRoomId(firstUid: string, secondUid: string): string {
  const valid = (uid: string) => /^[A-Za-z0-9_-]{1,128}$/.test(uid);
  if (!valid(firstUid) || !valid(secondUid) || firstUid === secondUid) {
    throw new Error('서로 다른 두 사용자가 있어야 채팅할 수 있어요.');
  }
  return [firstUid, secondUid].sort().join(':');
}

export function chatText(value: string): string {
  const text = value.trim();
  if (!text || text.length > 2000) throw new Error('메시지는 1~2000자로 입력해주세요.');
  return text;
}
