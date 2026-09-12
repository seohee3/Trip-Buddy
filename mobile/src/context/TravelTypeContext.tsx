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

import { useAuth } from '@/src/context/AuthContext';
import { logFirebaseError } from '@/src/firebase/errors';
import {
  fetchRemoteTravelTypeState,
  saveRemoteTravelType,
} from '@/src/firebase/travelTypeRepository';
import {
  clearTravelSurveyDraft,
  loadCachedTravelType,
  saveCachedTravelType,
  saveTravelSurveyDraft,
} from '@/src/storage/travelTypeStorage';
import type { TravelSurveyAnswers, TravelTypeResult } from '@/src/travel-type/model';
import { calculateTravelTypeResult } from '@/src/travel-type/scoring';

type TravelTypeContextValue = {
  travelType: TravelTypeResult | null;
  onboardingCompleted: boolean;
  isOnboardingReady: boolean;
  isSavingTravelType: boolean;
  completeSurvey: (answers: TravelSurveyAnswers) => Promise<TravelTypeResult>;
};

const TravelTypeContext = createContext<TravelTypeContextValue | null>(null);

export function TravelTypeProvider({ children }: PropsWithChildren) {
  const { user, isAuthReady } = useAuth();
  const [travelType, setTravelType] = useState<TravelTypeResult | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [isOnboardingReady, setIsOnboardingReady] = useState(false);
  const [isSavingTravelType, setIsSavingTravelType] = useState(false);
  const saveLockedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    setTravelType(null);
    setOnboardingCompleted(false);
    setIsOnboardingReady(false);

    if (!isAuthReady) return () => { mounted = false; };
    if (!user) {
      setIsOnboardingReady(true);
      return () => { mounted = false; };
    }

    const loadState = async () => {
      let cached: TravelTypeResult | null = null;
      try {
        cached = await loadCachedTravelType(user.uid);
      } catch (error) {
        console.error('여행유형 로컬 캐시 조회 실패:', error);
      }

      try {
        const remote = await fetchRemoteTravelTypeState(user.uid);
        if (!mounted) return;

        setTravelType(remote.onboardingCompleted ? remote.travelType : null);
        setOnboardingCompleted(remote.onboardingCompleted);
        if (remote.onboardingCompleted && remote.travelType) {
          void saveCachedTravelType(user.uid, remote.travelType).catch((error) => {
            console.error('여행유형 로컬 캐시 갱신 실패:', error);
          });
        }
      } catch (error) {
        logFirebaseError('여행유형 온보딩 상태 조회', error);
        if (!mounted) return;
        // 오프라인일 때도 이 UID에서 저장 성공했던 결과가 있으면 앱을 계속 사용할 수 있습니다.
        setTravelType(cached);
        setOnboardingCompleted(Boolean(cached));
      } finally {
        if (mounted) setIsOnboardingReady(true);
      }
    };

    void loadState();
    return () => { mounted = false; };
  }, [isAuthReady, user]);

  const completeSurvey = useCallback(async (answers: TravelSurveyAnswers) => {
    if (!user) throw new Error('여행유형을 저장하려면 로그인이 필요합니다.');
    if (saveLockedRef.current) throw new Error('여행유형 결과를 저장하고 있습니다.');
    const result = calculateTravelTypeResult(answers);
    if (!result) throw new Error('12개 질문에 모두 답해주세요.');

    saveLockedRef.current = true;
    setIsSavingTravelType(true);
    try {
      await saveTravelSurveyDraft(user.uid, answers, 11);
      await saveRemoteTravelType(user.uid, result, answers);

      try {
        await saveCachedTravelType(user.uid, result);
        await clearTravelSurveyDraft(user.uid);
      } catch (error) {
        console.error('여행유형 로컬 캐시 저장 실패:', error);
      }

      setTravelType(result);
      setOnboardingCompleted(true);
      return result;
    } finally {
      saveLockedRef.current = false;
      setIsSavingTravelType(false);
    }
  }, [user]);

  const value = useMemo<TravelTypeContextValue>(() => ({
    travelType,
    onboardingCompleted,
    isOnboardingReady,
    isSavingTravelType,
    completeSurvey,
  }), [completeSurvey, isOnboardingReady, isSavingTravelType, onboardingCompleted, travelType]);

  return <TravelTypeContext.Provider value={value}>{children}</TravelTypeContext.Provider>;
}

export function useTravelType() {
  const context = useContext(TravelTypeContext);
  if (!context) throw new Error('useTravelType must be used inside TravelTypeProvider');
  return context;
}
