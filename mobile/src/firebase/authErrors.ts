import { FirebaseConfigurationError } from '@/src/firebase/app';

export class AuthActionError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'AuthActionError';
    this.code = code;
  }
}

function firebaseErrorCode(error: unknown) {
  if (!error || typeof error !== 'object' || !('code' in error)) return null;
  return typeof error.code === 'string' ? error.code : null;
}

export function toAuthActionError(error: unknown): AuthActionError {
  if (error instanceof AuthActionError) return error;

  if (error instanceof FirebaseConfigurationError) {
    return new AuthActionError(
      'auth/configuration-error',
      '앱의 로그인 설정을 확인할 수 없습니다. 잠시 후 다시 시도해주세요.',
    );
  }

  const code = firebaseErrorCode(error) ?? 'auth/unknown-error';
  const messages: Record<string, string> = {
    'auth/email-already-in-use': '이미 가입된 이메일입니다. 로그인해주세요.',
    'auth/invalid-email': '올바른 이메일 주소를 입력해주세요.',
    'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'auth/user-not-found': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'auth/wrong-password': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'auth/missing-password': '비밀번호를 입력해주세요.',
    'auth/weak-password': '비밀번호는 6자 이상이어야 합니다.',
    'auth/user-disabled': '사용이 중지된 계정입니다. 관리자에게 문의해주세요.',
    'auth/too-many-requests': '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    'auth/network-request-failed': '네트워크 연결을 확인한 뒤 다시 시도해주세요.',
    'auth/operation-not-allowed': '이메일 로그인을 사용할 수 없습니다. 관리자에게 문의해주세요.',
    'auth/internal-error': '로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
  };

  return new AuthActionError(
    code,
    messages[code] ?? '인증 요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.',
  );
}
