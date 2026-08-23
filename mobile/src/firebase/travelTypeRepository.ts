import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { getFirebaseFirestore } from '@/src/firebase/app';
import { buildTravelTypeFirestorePayload, normalizeTravelTypeResult } from '@/src/travel-type/persistence';
import type { TravelSurveyAnswers, TravelTypeResult } from '@/src/travel-type/model';

export type RemoteTravelTypeState = {
  onboardingCompleted: boolean;
  travelType: TravelTypeResult | null;
};

export async function fetchRemoteTravelTypeState(uid: string): Promise<RemoteTravelTypeState> {
  if (!uid) throw new Error('여행유형을 불러오려면 로그인이 필요합니다.');
  const snapshot = await getDoc(doc(getFirebaseFirestore(), 'users', uid));
  if (!snapshot.exists()) return { onboardingCompleted: false, travelType: null };

  const data = snapshot.data();
  const travelType = normalizeTravelTypeResult(data.travelType);
  return {
    onboardingCompleted: data.onboardingCompleted === true && Boolean(travelType),
    travelType,
  };
}

export async function saveRemoteTravelType(
  uid: string,
  result: TravelTypeResult,
  answers: TravelSurveyAnswers,
) {
  if (!uid) throw new Error('여행유형을 저장하려면 로그인이 필요합니다.');
  const timestamp = serverTimestamp();
  const payload = buildTravelTypeFirestorePayload(result, answers, timestamp);
  await setDoc(doc(getFirebaseFirestore(), 'users', uid), payload, { merge: true });
}
