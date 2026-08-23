import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';

import { getFirebaseFirestore } from '@/src/firebase/app';
import { logFirebaseError } from '@/src/firebase/errors';
import type { UserProfile } from '@/src/types/travel';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function nonEmptyText(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function isRemoteProfileImage(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim()) return false;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function normalizeFirestoreProfile(value: unknown, localProfile: UserProfile): UserProfile {
  if (!isRecord(value)) return localProfile;

  // 이 기기에서 고른 로컬 사진은 원격의 이전 사진으로 덮지 않습니다.
  const localImageIsDeviceOnly = Boolean(localProfile.image) && !isRemoteProfileImage(localProfile.image);
  const image = localImageIsDeviceOnly
    ? localProfile.image
    : isRemoteProfileImage(value.image)
      ? value.image
      : localProfile.image;

  return {
    name: nonEmptyText(value.name, localProfile.name),
    bio: typeof value.bio === 'string' ? value.bio : localProfile.bio,
    image,
  };
}

function remoteImageValue(profile: UserProfile) {
  return isRemoteProfileImage(profile.image) ? profile.image : '';
}

function normalizedUserEmail(user: User) {
  return user.email?.trim().toLowerCase() ?? '';
}

function hasField(data: Record<string, unknown>, field: string) {
  return Object.prototype.hasOwnProperty.call(data, field);
}

function addRequiredAccountFields(
  payload: Record<string, unknown>,
  data: Record<string, unknown> | null,
  user: User,
) {
  if (!data || data.email !== normalizedUserEmail(user)) {
    payload.email = normalizedUserEmail(user);
  }
  if (!data || typeof data.onboardingCompleted !== 'boolean') {
    payload.onboardingCompleted = false;
  }
  if (!data || !hasField(data, 'travelType')) {
    payload.travelType = null;
  }
  if (!data || !hasField(data, 'createdAt')) {
    payload.createdAt = serverTimestamp();
  }
}

export async function createRegistrationProfileDocument(
  user: User,
  profile: UserProfile,
): Promise<void> {
  const firestore = getFirebaseFirestore();
  const profileRef = doc(firestore, 'users', user.uid);
  const snapshot = await getDoc(profileRef);
  const storedData = snapshot.exists() ? snapshot.data() : null;
  const payload: Record<string, unknown> = {
    name: profile.name,
    email: normalizedUserEmail(user),
    bio: profile.bio,
    image: remoteImageValue(profile),
    updatedAt: serverTimestamp(),
  };

  addRequiredAccountFields(payload, storedData, user);
  await setDoc(profileRef, payload, { merge: true });
}

/** 원격 문서가 있으면 복원하고, 없으면 로컬 프로필을 최초 1회 이관합니다. */
export async function hydrateProfileFromFirestore(
  user: User,
  localProfile: UserProfile,
): Promise<UserProfile> {
  const firestore = getFirebaseFirestore();
  const profileRef = doc(firestore, 'users', user.uid);
  const snapshot = await getDoc(profileRef);

  if (snapshot.exists()) {
    const storedData = snapshot.data();
    const hydratedProfile = normalizeFirestoreProfile(storedData, localProfile);
    const repairPayload: Record<string, unknown> = {};

    if (nonEmptyText(storedData.name, '') === '') repairPayload.name = hydratedProfile.name;
    if (typeof storedData.bio !== 'string') repairPayload.bio = hydratedProfile.bio;
    if (typeof storedData.image !== 'string' || (storedData.image && !isRemoteProfileImage(storedData.image))) {
      repairPayload.image = remoteImageValue(hydratedProfile);
    }
    addRequiredAccountFields(repairPayload, storedData, user);

    if (Object.keys(repairPayload).length > 0) {
      repairPayload.updatedAt = serverTimestamp();
      setDoc(profileRef, repairPayload, { merge: true }).catch((error) => {
        logFirebaseError('프로필 문서 필드 보완', error);
      });
    }

    return hydratedProfile;
  }

  await setDoc(profileRef, {
    name: localProfile.name,
    email: normalizedUserEmail(user),
    bio: localProfile.bio,
    image: remoteImageValue(localProfile),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    onboardingCompleted: false,
    travelType: null,
  }, { merge: true });

  return localProfile;
}

/** 로컬 URI는 Firestore에 쓰지 않고, 기존 원격 이미지가 있으면 그대로 보존합니다. */
export async function saveProfileToFirestore(user: User, profile: UserProfile): Promise<void> {
  const firestore = getFirebaseFirestore();
  const profileRef = doc(firestore, 'users', user.uid);
  const snapshot = await getDoc(profileRef);
  const storedData = snapshot.exists() ? snapshot.data() : null;
  const payload: Record<string, unknown> = {
    name: profile.name,
    email: normalizedUserEmail(user),
    bio: profile.bio,
    updatedAt: serverTimestamp(),
  };

  addRequiredAccountFields(payload, storedData, user);

  if (isRemoteProfileImage(profile.image)) {
    payload.image = profile.image;
  } else if (!storedData || !isRemoteProfileImage(storedData.image)) {
    payload.image = '';
  }

  await setDoc(profileRef, payload, { merge: true });
}
