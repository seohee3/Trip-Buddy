const TRAVEL_TYPE_KEY_PREFIX = '@trip-buddy/travel-type/';
const TRAVEL_SURVEY_DRAFT_KEY_PREFIX = '@trip-buddy/travel-survey-draft/';

function assertUid(uid: string) {
  if (!uid) throw new Error('여행유형 데이터를 불러오려면 사용자 UID가 필요합니다.');
}

export function getTravelTypeCacheKey(uid: string) {
  assertUid(uid);
  return `${TRAVEL_TYPE_KEY_PREFIX}${uid}`;
}

export function getTravelSurveyDraftKey(uid: string) {
  assertUid(uid);
  return `${TRAVEL_SURVEY_DRAFT_KEY_PREFIX}${uid}`;
}
