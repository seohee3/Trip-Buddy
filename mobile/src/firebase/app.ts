import { getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

let appInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;

export class FirebaseConfigurationError extends Error {
  constructor(missingVariables: string[]) {
    super(`필수 Firebase 환경변수가 누락되었습니다: ${missingVariables.join(', ')}`);
    this.name = 'FirebaseConfigurationError';
  }
}

function readFirebaseConfig(): FirebaseOptions {
  // Expo는 EXPO_PUBLIC_* 값을 정적 dot notation으로 참조할 때 앱 번들에 치환합니다.
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;

  const missingVariables: string[] = [];
  if (!apiKey) missingVariables.push('EXPO_PUBLIC_FIREBASE_API_KEY');
  if (!authDomain) missingVariables.push('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!projectId) missingVariables.push('EXPO_PUBLIC_FIREBASE_PROJECT_ID');
  if (!storageBucket) missingVariables.push('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET');
  if (!messagingSenderId) missingVariables.push('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  if (!appId) missingVariables.push('EXPO_PUBLIC_FIREBASE_APP_ID');

  if (missingVariables.length > 0) {
    throw new FirebaseConfigurationError(missingVariables);
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

export function getFirebaseApp(): FirebaseApp {
  if (appInstance) return appInstance;

  const config = readFirebaseConfig();
  const existingDefaultApp = getApps().find((candidate) => candidate.name === '[DEFAULT]');
  appInstance = existingDefaultApp ?? initializeApp(config);
  return appInstance;
}

export function getFirebaseFirestore(): Firestore {
  if (firestoreInstance) return firestoreInstance;

  firestoreInstance = getFirestore(getFirebaseApp());
  return firestoreInstance;
}
