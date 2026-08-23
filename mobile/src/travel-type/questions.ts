import type { TravelSurveyQuestion } from './model.ts';

export const TRAVEL_SURVEY_QUESTIONS: readonly TravelSurveyQuestion[] = [
  {
    id: 'schedule-detail',
    axis: 'PS',
    prompt: '여행을 준비할 때 어느 쪽이 더 마음에 편한가요?',
    options: [
      { label: '출발 전 이동과 방문 시간을 차근차근 정해둬요', value: 'P' },
      { label: '큰 방향만 잡고 현장에서 끌리는 대로 정해요', value: 'S' },
    ],
  },
  {
    id: 'daily-pace',
    axis: 'AR',
    prompt: '하루 여행 코스를 고른다면 어떤 흐름이 좋은가요?',
    options: [
      { label: '여러 장소를 알차게 오가며 다양한 장면을 만나요', value: 'A' },
      { label: '한두 장소에 머물며 여유롭게 분위기를 즐겨요', value: 'R' },
    ],
  },
  {
    id: 'place-choice',
    axis: 'LH',
    prompt: '낯선 도시에 도착했을 때 먼저 향하고 싶은 곳은?',
    options: [
      { label: '그 도시를 대표하는 꼭 가볼 만한 명소', value: 'L' },
      { label: '우연히 발견한 한적한 골목과 작은 공간', value: 'H' },
    ],
  },
  {
    id: 'sharing-pace',
    axis: 'TI',
    prompt: '여행의 순간을 즐기는 방식은 어느 쪽에 가까운가요?',
    options: [
      { label: '여러 사람과 일정과 감정을 나누며 즐겨요', value: 'T' },
      { label: '내 속도로 장면에 몰입하며 깊이 즐겨요', value: 'I' },
    ],
  },
  {
    id: 'booking-style',
    axis: 'PS',
    prompt: '숙소와 식당을 정할 때 선호하는 방식은?',
    options: [
      { label: '후보를 비교하고 미리 예약해 마음 놓고 떠나요', value: 'P' },
      { label: '그날의 상황과 기분에 맞는 곳을 골라요', value: 'S' },
    ],
  },
  {
    id: 'activity-break',
    axis: 'AR',
    prompt: '오후 시간이 비었다면 무엇을 더 하고 싶나요?',
    options: [
      { label: '걷기나 체험을 더해 몸으로 여행지를 느껴요', value: 'A' },
      { label: '카페나 쉼터에서 천천히 재충전해요', value: 'R' },
    ],
  },
  {
    id: 'photo-memory',
    axis: 'LH',
    prompt: '오래 남기고 싶은 여행의 장면은 어떤 모습인가요?',
    options: [
      { label: '유명한 풍경을 직접 보고 남긴 대표 사진', value: 'L' },
      { label: '나만 알아본 장소에서 건진 뜻밖의 발견', value: 'H' },
    ],
  },
  {
    id: 'people-time',
    axis: 'TI',
    prompt: '여행 중 생긴 자유 시간에는 무엇이 끌리나요?',
    options: [
      { label: '새로운 사람과 인사하고 이야기를 나눠요', value: 'T' },
      { label: '조용한 개인 시간을 가지며 생각을 정리해요', value: 'I' },
    ],
  },
  {
    id: 'plan-change',
    axis: 'PS',
    prompt: '예상치 못한 새 선택지가 나타났을 때 나는?',
    options: [
      { label: '원래 일정의 흐름을 지키며 가능한 범위에서 조정해요', value: 'P' },
      { label: '새로운 기회를 따라 일정을 기분 좋게 바꿔요', value: 'S' },
    ],
  },
  {
    id: 'trip-satisfaction',
    axis: 'AR',
    prompt: '여행을 마친 뒤 더 큰 만족을 주는 것은?',
    options: [
      { label: '다채로운 경험을 충분히 해봤다는 뿌듯함', value: 'A' },
      { label: '몸과 마음이 넉넉히 충전됐다는 편안함', value: 'R' },
    ],
  },
  {
    id: 'information-source',
    axis: 'LH',
    prompt: '다음 여행지를 찾을 때 더 눈길이 가는 정보는?',
    options: [
      { label: '많은 여행자가 선택한 인기 순위와 대표 코스', value: 'L' },
      { label: '현지인이 조용히 추천하는 동네 장소와 길', value: 'H' },
    ],
  },
  {
    id: 'conversation-style',
    axis: 'TI',
    prompt: '나에게 더 자연스러운 여행 분위기는?',
    options: [
      { label: '대화와 반응이 오가며 추억을 함께 만드는 여행', value: 'T' },
      { label: '혼자 집중할 여백이 있어 감상을 깊게 하는 여행', value: 'I' },
    ],
  },
] as const;
