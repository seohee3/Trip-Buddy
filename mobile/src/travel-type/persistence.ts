import { TRAVEL_TYPE_BY_CODE } from './catalog.ts';
import {
  AXIS_POLES,
  TRAVEL_AXIS_ORDER,
  type TravelAxisScores,
  type TravelSurveyAnswers,
  type TravelTypeResult,
} from './model.ts';
import { TRAVEL_SURVEY_QUESTIONS } from './questions.ts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeAxisScores(value: unknown): TravelAxisScores | null {
  if (!isRecord(value)) return null;
  const normalized = {} as TravelAxisScores;

  for (const axis of TRAVEL_AXIS_ORDER) {
    const raw = value[axis];
    const [left, right] = AXIS_POLES[axis];
    if (!isRecord(raw)) return null;
    if (
      raw.left !== left ||
      raw.right !== right ||
      typeof raw.leftScore !== 'number' ||
      typeof raw.rightScore !== 'number' ||
      typeof raw.leftPercent !== 'number' ||
      typeof raw.rightPercent !== 'number' ||
      raw.leftScore + raw.rightScore !== 3
    ) {
      return null;
    }
    normalized[axis] = {
      left,
      right,
      leftScore: raw.leftScore,
      rightScore: raw.rightScore,
      leftPercent: raw.leftPercent,
      rightPercent: raw.rightPercent,
    };
  }

  return normalized;
}

export function normalizeTravelTypeResult(value: unknown): TravelTypeResult | null {
  if (!isRecord(value) || typeof value.code !== 'string') return null;
  const definition = TRAVEL_TYPE_BY_CODE[value.code as keyof typeof TRAVEL_TYPE_BY_CODE];
  const axisScores = normalizeAxisScores(value.axisScores);
  if (!definition || !axisScores) return null;

  return {
    code: definition.code,
    name: definition.name,
    summary: definition.summary,
    tags: [...definition.tags],
    axisScores,
    version: typeof value.version === 'number' ? value.version : 1,
  };
}

export function buildTravelTypeFirestorePayload(
  result: TravelTypeResult,
  answers: TravelSurveyAnswers,
  timestamp: unknown,
) {
  const normalizedAnswers = Object.fromEntries(
    TRAVEL_SURVEY_QUESTIONS.map((question) => [question.id, answers[question.id]]),
  ) as TravelSurveyAnswers;

  return {
    onboardingCompleted: true,
    travelType: {
      code: result.code,
      name: result.name,
      summary: result.summary,
      tags: [...result.tags],
      axisScores: result.axisScores,
      version: result.version,
    },
    travelSurveyAnswers: normalizedAnswers,
    travelTypeCompletedAt: timestamp,
    updatedAt: timestamp,
  };
}

export function hasUndefinedDeep(value: unknown): boolean {
  if (value === undefined) return true;
  if (Array.isArray(value)) return value.some(hasUndefinedDeep);
  if (isRecord(value)) return Object.values(value).some(hasUndefinedDeep);
  return false;
}
