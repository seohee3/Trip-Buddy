import {
  addDoc, collection, doc, getDoc, limitToLast, onSnapshot, orderBy,
  query, runTransaction, serverTimestamp,
} from 'firebase/firestore';

import { getFirebaseFirestore } from '@/src/firebase/app';
import { chatRoomId, chatText } from '@/src/firebase/chatIdentity';

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  createdAt: number | null;
  pending: boolean;
};

export async function openMateChat(uid: string, mateId: string): Promise<string> {
  if (!mateId || mateId.includes('/')) throw new Error('메이트 정보가 올바르지 않아요.');
  const db = getFirebaseFirestore();
  const mate = await getDoc(doc(db, 'mates', mateId));
  // Demo document IDs (1, 2, ...) are not Firebase Auth UIDs.
  const peerUid: unknown = mate.data()?.userId;
  if (!mate.exists() || typeof peerUid !== 'string' || !peerUid) {
    throw new Error('아직 채팅 계정이 연결되지 않은 메이트예요. 다른 메이트를 선택해주세요.');
  }
  if (uid === peerUid) throw new Error('내 프로필과는 채팅할 수 없어요.');
  const roomId = chatRoomId(uid, peerUid);
  const room = doc(db, 'chatRooms', roomId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(room);
    if (!snapshot.exists()) {
      transaction.set(room, {
        participants: [uid, peerUid].sort(),
        createdAt: serverTimestamp(),
      });
    }
  });
  return roomId;
}

export function subscribeChat(
  roomId: string,
  onMessages: (messages: ChatMessage[]) => void,
  onError: (error: Error) => void,
) {
  const messages = query(
    collection(getFirebaseFirestore(), 'chatRooms', roomId, 'messages'),
    orderBy('createdAt', 'asc'),
    limitToLast(200),
  );
  return onSnapshot(messages, { includeMetadataChanges: true }, (snapshot) => {
    onMessages(snapshot.docs.map((message) => {
      const data = message.data({ serverTimestamps: 'estimate' });
      return {
        id: message.id,
        senderId: data.senderId,
        text: data.text,
        createdAt: data.createdAt?.toMillis() ?? null,
        pending: message.metadata.hasPendingWrites,
      };
    }));
  }, onError);
}

export async function sendChatMessage(roomId: string, senderId: string, value: string) {
  await addDoc(collection(getFirebaseFirestore(), 'chatRooms', roomId, 'messages'), {
    senderId,
    text: chatText(value),
    createdAt: serverTimestamp(),
  });
}
