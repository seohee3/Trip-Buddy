import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseAuthProfile,
  type User,
} from 'firebase/auth';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import { getFirebaseAuth } from '@/src/firebase/auth';
import { AuthActionError, toAuthActionError } from '@/src/firebase/authErrors';
import { normalizeEmail } from '@/src/firebase/authValidation';
import { logFirebaseError } from '@/src/firebase/errors';
import { createRegistrationProfileDocument } from '@/src/firebase/profileRepository';
import {
  createDefaultUserProfile,
  loadUserProfile,
  persistProfile,
} from '@/src/storage/travelStorage';

type AuthContextValue = {
  user: User | null;
  isAuthReady: boolean;
  isSubmitting: boolean;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionLockedRef = useRef(false);
  const authTransitionRef = useRef(false);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(
        getFirebaseAuth(),
        (nextUser) => {
          if (!authTransitionRef.current) setUser(nextUser);
          setIsAuthReady(true);
        },
        (error) => {
          logFirebaseError('인증 상태 확인', error);
          if (!authTransitionRef.current) setUser(null);
          setIsAuthReady(true);
        },
      );

      return unsubscribe;
    } catch (error) {
      logFirebaseError('인증 초기화', error);
      setUser(null);
      setIsAuthReady(true);
      return undefined;
    }
  }, []);

  const runAuthRequest = useCallback(async (operation: () => Promise<void>) => {
    if (submissionLockedRef.current) {
      throw new AuthActionError('auth/request-in-progress', '이미 인증 요청을 처리하고 있습니다.');
    }

    submissionLockedRef.current = true;
    authTransitionRef.current = true;
    setIsSubmitting(true);

    try {
      await operation();
    } catch (error) {
      logFirebaseError('이메일 인증 요청', error);
      throw toAuthActionError(error);
    } finally {
      authTransitionRef.current = false;
      submissionLockedRef.current = false;
      setIsSubmitting(false);

      try {
        setUser(getFirebaseAuth().currentUser);
      } catch {
        setUser(null);
      }
    }
  }, []);

  const registerWithEmail = useCallback(
    async (name: string, email: string, password: string) => {
      const normalizedName = name.trim();
      const normalizedEmail = normalizeEmail(email);

      await runAuthRequest(async () => {
        const credential = await createUserWithEmailAndPassword(
          getFirebaseAuth(),
          normalizedEmail,
          password,
        );

        try {
          await updateFirebaseAuthProfile(credential.user, { displayName: normalizedName });
        } catch (error) {
          logFirebaseError('회원 이름 저장', error);
        }

        const fallbackProfile = createDefaultUserProfile(normalizedName, normalizedEmail);
        let registrationProfile = fallbackProfile;

        try {
          const cachedProfile = await loadUserProfile(credential.user.uid, fallbackProfile);
          registrationProfile = { ...cachedProfile, name: normalizedName };
          await persistProfile(credential.user.uid, registrationProfile);
        } catch (error) {
          logFirebaseError('회원가입 로컬 프로필 준비', error);
        }

        // Firestore 응답이 지연되어도 이미 생성된 Auth 계정으로 앱에 진입할 수 있게 합니다.
        void createRegistrationProfileDocument(credential.user, registrationProfile).catch((error) => {
          // 로그인 직후 TravelDataProvider가 같은 문서 생성을 재시도합니다.
          logFirebaseError('회원가입 프로필 문서 생성', error);
        });
      });
    },
    [runAuthRequest],
  );

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      await runAuthRequest(async () => {
        await signInWithEmailAndPassword(getFirebaseAuth(), normalizeEmail(email), password);
      });
    },
    [runAuthRequest],
  );

  const logout = useCallback(async () => {
    await runAuthRequest(async () => {
      await signOut(getFirebaseAuth());
    });
  }, [runAuthRequest]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthReady,
      isSubmitting,
      registerWithEmail,
      loginWithEmail,
      logout,
    }),
    [isAuthReady, isSubmitting, loginWithEmail, logout, registerWithEmail, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
