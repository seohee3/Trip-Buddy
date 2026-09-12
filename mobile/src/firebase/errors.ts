import { FirebaseConfigurationError } from '@/src/firebase/app';

function getErrorCode(error: unknown) {
  if (!error || typeof error !== 'object' || !('code' in error)) return null;
  return typeof error.code === 'string' ? error.code : null;
}

/** Firebase 설정값이나 요청 payload를 노출하지 않는 개발용 오류 로그입니다. */
export function logFirebaseError(operation: string, error: unknown) {
  const reason = error instanceof FirebaseConfigurationError
    ? error.message
    : getErrorCode(error) ?? (error instanceof Error ? error.name : 'unknown-error');

  console.warn(`[Firebase] ${operation} 실패 (${reason})`);
}
