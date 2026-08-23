import {
  browserLocalPersistence,
  getAuth,
  initializeAuth,
  type Auth,
} from 'firebase/auth';

import { getFirebaseApp } from '@/src/firebase/app';

let authInstance: Auth | null = null;

function isAlreadyInitializedError(error: unknown) {
  return Boolean(
    error
      && typeof error === 'object'
      && 'code' in error
      && error.code === 'auth/already-initialized',
  );
}

export function getFirebaseAuth(): Auth {
  if (authInstance) return authInstance;

  const app = getFirebaseApp();

  try {
    authInstance = initializeAuth(app, { persistence: browserLocalPersistence });
  } catch (error) {
    if (!isAlreadyInitializedError(error)) throw error;
    authInstance = getAuth(app);
  }

  return authInstance;
}
