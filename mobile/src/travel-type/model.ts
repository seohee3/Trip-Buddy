export const TRAVEL_AXIS_ORDER = ['PS', 'AR', 'LH', 'TI'] as const;

export type TravelAxis = (typeof TRAVEL_AXIS_ORDER)[number];
export type TravelPole = 'P' | 'S' | 'A' | 'R' | 'L' | 'H' | 'T' | 'I';
export type TravelTypeCode = `${'P' | 'S'}${'A' | 'R'}${'L' | 'H'}${'T' | 'I'}`;

export type TravelSurveyOption = {
  label: string;
  value: TravelPole;
};

export type TravelSurveyQuestion = {
  id: string;
  axis: TravelAxis;
  prompt: string;
  options: readonly [TravelSurveyOption, TravelSurveyOption];
};

export type TravelSurveyAnswers = Record<string, TravelPole>;

export type AxisPercentages = {
  left: TravelPole;
  right: TravelPole;
  leftScore: number;
  rightScore: number;
  leftPercent: number;
  rightPercent: number;
};

export type TravelAxisScores = Record<TravelAxis, AxisPercentages>;

export type TravelTypeDefinition = {
  code: TravelTypeCode;
  name: string;
  summary: string;
  description: string;
  strengths: readonly string[];
  caution: string;
  tags: readonly string[];
  contentTypeIds: readonly string[];
  mateAxes: Readonly<Record<TravelAxis, TravelPole>>;
  color: string;
  icon: string;
};

export type TravelTypeResult = {
  code: TravelTypeCode;
  name: string;
  summary: string;
  tags: string[];
  axisScores: TravelAxisScores;
  version: number;
};

export type TravelSurveyDraft = {
  answers: Partial<TravelSurveyAnswers>;
  currentIndex: number;
  updatedAt: string;
};

export const TRAVEL_TYPE_VERSION = 1;

export const AXIS_POLES: Readonly<Record<TravelAxis, readonly [TravelPole, TravelPole]>> = {
  PS: ['P', 'S'],
  AR: ['A', 'R'],
  LH: ['L', 'H'],
  TI: ['T', 'I'],
};

export const AXIS_LABELS: Readonly<Record<TravelAxis, readonly [string, string]>> = {
  PS: ['계획형', '즉흥형'],
  AR: ['활동형', '휴식형'],
  LH: ['유명 명소형', '숨은 장소형'],
  TI: ['함께 여행형', '혼자 집중형'],
};

export function codeToAxisPreferences(
  code: TravelTypeCode,
): Record<TravelAxis, TravelPole> {
  return {
    PS: code[0] as TravelPole,
    AR: code[1] as TravelPole,
    LH: code[2] as TravelPole,
    TI: code[3] as TravelPole,
  };
}

export function isTravelTypeCode(value: unknown): value is TravelTypeCode {
  return typeof value === 'string' && /^[PS][AR][LH][TI]$/.test(value);
}
