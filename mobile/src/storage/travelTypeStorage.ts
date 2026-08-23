import AsyncStorage from '@react-native-async-storage/async-storage';

import { getTravelSurveyDraftKey, getTravelTypeCacheKey } from '@/src/travel-type/cacheKeys';
import { normalizeTravelTypeResult } from '@/src/travel-type/persistence';
import { TRAVEL_SURVEY_QUESTIONS } from '@/src/travel-type/questions';
import type {
  TravelSurveyDraft,
  TravelSurveyAnswers,
  TravelTypeResult,
} from '@/src/travel-type/model';

export async function loadCachedTravelType(uid: string): Promise<TravelTypeResult | null> {
  const value = await AsyncStorage.getItem(getTravelTypeCacheKey(uid));
  if (!value) return null;

  try {
    return normalizeTravelTypeResult(JSON.parse(value));
  } catch {
    return null;
  }
}

export async function saveCachedTravelType(uid: string, result: TravelTypeResult) {
  await AsyncStorage.setItem(getTravelTypeCacheKey(uid), JSON.stringify(result));
}

export async function loadTravelSurveyDraft(uid: string): Promise<TravelSurveyDraft | null> {
  const value = await AsyncStorage.getItem(getTravelSurveyDraftKey(uid));
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<TravelSurveyDraft>;
    if (!parsed || typeof parsed !== 'object') return null;
    const answers: Partial<TravelSurveyAnswers> = {};

    for (const question of TRAVEL_SURVEY_QUESTIONS) {
      const answer = parsed.answers?.[question.id];
      if (question.options.some((option) => option.value === answer)) answers[question.id] = answer;
    }

    return {
      answers,
      currentIndex:
        typeof parsed.currentIndex === 'number'
          ? Math.max(0, Math.min(TRAVEL_SURVEY_QUESTIONS.length - 1, Math.floor(parsed.currentIndex)))
          : 0,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

export async function saveTravelSurveyDraft(
  uid: string,
  answers: Partial<TravelSurveyAnswers>,
  currentIndex: number,
) {
  const draft: TravelSurveyDraft = {
    answers,
    currentIndex,
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(getTravelSurveyDraftKey(uid), JSON.stringify(draft));
}

export async function clearTravelSurveyDraft(uid: string) {
  await AsyncStorage.removeItem(getTravelSurveyDraftKey(uid));
}
