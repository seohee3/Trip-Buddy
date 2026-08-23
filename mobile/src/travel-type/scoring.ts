import { TRAVEL_TYPE_BY_CODE } from './catalog.ts';
import {
  AXIS_POLES,
  TRAVEL_AXIS_ORDER,
  TRAVEL_TYPE_VERSION,
  type AxisPercentages,
  type TravelAxisScores,
  type TravelPole,
  type TravelSurveyAnswers,
  type TravelTypeCode,
  type TravelTypeResult,
} from './model.ts';
import { TRAVEL_SURVEY_QUESTIONS } from './questions.ts';

export function calculateTravelTypeResult(
  answers: Partial<TravelSurveyAnswers>,
): TravelTypeResult | null {
  const counts = Object.fromEntries(
    Object.values(AXIS_POLES).flat().map((pole) => [pole, 0]),
  ) as Record<TravelPole, number>;

  for (const question of TRAVEL_SURVEY_QUESTIONS) {
    const answer = answers[question.id];
    if (!answer || !question.options.some((option) => option.value === answer)) return null;
    counts[answer] += 1;
  }

  const axisScores = {} as TravelAxisScores;
  let code = '';

  for (const axis of TRAVEL_AXIS_ORDER) {
    const [left, right] = AXIS_POLES[axis];
    const leftScore = counts[left];
    const rightScore = counts[right];
    if (leftScore + rightScore !== 3 || leftScore === rightScore) return null;

    const score: AxisPercentages = {
      left,
      right,
      leftScore,
      rightScore,
      leftPercent: Math.round((leftScore / 3) * 100),
      rightPercent: Math.round((rightScore / 3) * 100),
    };
    axisScores[axis] = score;
    code += leftScore > rightScore ? left : right;
  }

  const definition = TRAVEL_TYPE_BY_CODE[code as TravelTypeCode];
  if (!definition) return null;

  return {
    code: definition.code,
    name: definition.name,
    summary: definition.summary,
    tags: [...definition.tags],
    axisScores,
    version: TRAVEL_TYPE_VERSION,
  };
}
