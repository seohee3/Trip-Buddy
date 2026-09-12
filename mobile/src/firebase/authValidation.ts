export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export function validateRegistrationInput(input: {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}): string | null {
  if (!input.name.trim()) return '이름을 입력해주세요.';
  if (!isValidEmail(input.email)) return '올바른 이메일 주소를 입력해주세요.';
  if (input.password.length < 6) return '비밀번호는 6자 이상이어야 합니다.';
  if (input.password !== input.passwordConfirmation) return '비밀번호가 일치하지 않습니다.';
  return null;
}

export function validateLoginInput(input: { email: string; password: string }): string | null {
  if (!isValidEmail(input.email)) return '올바른 이메일 주소를 입력해주세요.';
  if (!input.password) return '비밀번호를 입력해주세요.';
  return null;
}
