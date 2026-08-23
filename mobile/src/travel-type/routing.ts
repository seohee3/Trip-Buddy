export type AppAccess = 'loading' | 'auth' | 'survey' | 'app';

export function resolveAppAccess(
  isAuthReady: boolean,
  hasUser: boolean,
  isOnboardingReady: boolean,
  onboardingCompleted: boolean,
): AppAccess {
  if (!isAuthReady || (hasUser && !isOnboardingReady)) return 'loading';
  if (!hasUser) return 'auth';
  return onboardingCompleted ? 'app' : 'survey';
}
