import {
  codeToAxisPreferences,
  type TravelTypeCode,
  type TravelTypeDefinition,
} from './model.ts';

type CatalogCopy = Omit<TravelTypeDefinition, 'mateAxes'>;

function defineType(copy: CatalogCopy): TravelTypeDefinition {
  return { ...copy, mateAxes: codeToAxisPreferences(copy.code) };
}

const TYPES: readonly CatalogCopy[] = [
  { code: 'PALT', name: '별빛 일정 지휘자', summary: '대표 명소를 알찬 일정과 좋은 사람들로 채워요.', description: '꼭 보고 싶은 장면을 놓치지 않도록 흐름을 설계하고, 동행과 활기차게 경험을 나누는 여행자예요.', strengths: ['복잡한 일정도 안정적으로 이끌어요', '함께하는 사람의 추억을 풍성하게 만들어요'], caution: '모두의 체력과 즉석에서 생기는 즐거움을 위한 여백도 남겨보세요.', tags: ['대표명소', '체험', '축제'], contentTypeIds: ['12', '28', '15'], color: '#5C3DFF', icon: 'map' },
  { code: 'PALI', name: '정밀 풍경 탐사자', summary: '계획한 대표 코스를 내 속도로 깊게 완주해요.', description: '사전 조사로 핵심 명소를 골라두고, 현장에서는 스스로의 리듬에 집중해 밀도 높은 경험을 쌓아요.', strengths: ['준비가 탄탄해 중요한 장면을 놓치지 않아요', '혼자서도 긴 코스를 꾸준히 소화해요'], caution: '계획 밖의 작은 장소에도 잠깐 시선을 건네면 여행이 더 입체적이에요.', tags: ['자연', '역사', '트레킹'], contentTypeIds: ['12', '14', '28'], color: '#3E63DD', icon: 'compass' },
  { code: 'PAHT', name: '로컬 원정 대장', summary: '숨은 동네를 찾아 팀과 힘차게 누벼요.', description: '잘 알려지지 않은 장소를 미리 발굴하고, 동행이 함께 즐길 수 있는 활동적인 로컬 코스를 만들어요.', strengths: ['새로운 장소를 믿음직하게 안내해요', '팀의 활동 에너지를 끌어올려요'], caution: '숨은 장소의 운영 시간과 주민 생활을 미리 확인하고 배려해주세요.', tags: ['로컬', '골목', '체험'], contentTypeIds: ['25', '28', '38'], color: '#1F8A70', icon: 'trail-sign' },
  { code: 'PAHI', name: '비밀길 완주자', summary: '찾아둔 숨은 코스를 혼자 힘껏 탐사해요.', description: '꼼꼼히 발견한 로컬 목적지를 자신의 속도로 누비며 남다른 여행 기록을 완성하는 탐사형 여행자예요.', strengths: ['희소한 정보를 실행 가능한 코스로 만들어요', '몰입과 활동을 균형 있게 이어가요'], caution: '한적한 장소를 혼자 찾을 때는 이동편과 귀가 시간을 꼭 점검하세요.', tags: ['숨은명소', '산책', '탐방'], contentTypeIds: ['25', '12', '28'], color: '#21867A', icon: 'footsteps' },
  { code: 'PRLT', name: '여유 명소 큐레이터', summary: '검증된 명소를 편안한 흐름으로 함께 즐겨요.', description: '대표 장소를 무리 없는 순서로 골라 동행 모두가 편안하게 감상할 수 있는 여행을 만들어요.', strengths: ['안정적이고 편안한 일정을 만들어요', '좋은 장면을 함께 음미하게 해요'], caution: '인기 장소의 혼잡 시간을 피할 대안 한 곳을 준비하면 더 여유로워요.', tags: ['문화', '전망', '맛집'], contentTypeIds: ['14', '12', '39'], color: '#8267BE', icon: 'images' },
  { code: 'PRLI', name: '고요한 명작 감상가', summary: '대표 문화와 풍경을 차분히 깊게 바라봐요.', description: '검증된 장소를 미리 고르고 충분한 관람 시간을 확보해 혼자만의 감상을 단단히 쌓는 여행자예요.', strengths: ['한 장소의 가치를 깊게 발견해요', '차분하고 안정적인 여행 리듬을 지켜요'], caution: '예약 시간 사이에 예상보다 긴 관람을 위한 완충 시간을 두세요.', tags: ['박물관', '정원', '산책'], contentTypeIds: ['14', '12', '25'], color: '#6B6ECF', icon: 'book' },
  { code: 'PRHT', name: '동네 쉼표 안내자', summary: '한적한 로컬 휴식처를 찾아 함께 쉬어가요.', description: '조용한 동네와 작은 공간을 세심하게 엮어 동행에게 편안한 하루를 선물하는 여행자예요.', strengths: ['복잡하지 않은 특별한 코스를 찾아요', '동행의 컨디션을 세심하게 살펴요'], caution: '작은 가게와 공간은 휴무가 잦으니 방문 전 확인이 필요해요.', tags: ['로컬카페', '골목', '휴식'], contentTypeIds: ['39', '25', '14'], color: '#9A6FB0', icon: 'cafe' },
  { code: 'PRHI', name: '느린 골목 기록가', summary: '숨은 장소에 오래 머물며 나만의 기록을 남겨요.', description: '한적한 골목과 작은 문화 공간을 계획해두고, 혼자 차분히 머물며 섬세한 기억을 모아요.', strengths: ['평범한 동네의 결을 세밀하게 발견해요', '휴식과 기록을 꾸준히 이어가요'], caution: '혼자 머무는 시간이 길어질 때 다음 이동편을 놓치지 않도록 알림을 활용하세요.', tags: ['골목', '독립서점', '감성카페'], contentTypeIds: ['25', '14', '39'], color: '#A0618E', icon: 'pencil' },
  { code: 'SALT', name: '번개 여행 메이트', summary: '유명한 즐길 거리를 사람들과 즉시 경험해요.', description: '현장의 열기를 빠르게 읽고 대표 체험과 축제로 동행을 이끄는 에너지 넘치는 여행자예요.', strengths: ['갑작스러운 기회도 즐거운 추억으로 바꿔요', '사람들과 빠르게 분위기를 만들어요'], caution: '인기 행사와 체험은 매진될 수 있으니 핵심 한 곳만큼은 확인해보세요.', tags: ['축제', '액티비티', '핫플'], contentTypeIds: ['15', '28', '12'], color: '#E05A47', icon: 'flash' },
  { code: 'SALI', name: '자유 궤도 모험가', summary: '마음이 향하는 대표 장소를 혼자 역동적으로 누벼요.', description: '그날의 감각을 따라 유명한 풍경과 활동을 골라 자신의 리듬으로 과감하게 경험해요.', strengths: ['변화에 빠르게 적응해 기회를 잡아요', '스스로 활동적인 하루를 만들어요'], caution: '혼자 하는 즉흥 활동은 안전 수칙과 운영 종료 시간을 먼저 살펴보세요.', tags: ['모험', '자연', '레포츠'], contentTypeIds: ['28', '12', '14'], color: '#D95D39', icon: 'rocket' },
  { code: 'SAHT', name: '골목 축제 개척단', summary: '새로운 로컬 재미를 발견해 사람들과 나눠요.', description: '현장에서 만난 숨은 행사와 체험을 놓치지 않고, 동행과 생생한 동네 에너지를 즐겨요.', strengths: ['예상 밖의 재미를 빠르게 발견해요', '로컬 경험을 함께할 사람을 잘 모아요'], caution: '주민의 일상 공간에서는 소음과 촬영 예절을 세심하게 지켜주세요.', tags: ['지역축제', '시장', '체험'], contentTypeIds: ['15', '28', '38'], color: '#F07A45', icon: 'megaphone' },
  { code: 'SAHI', name: '즉흥 비경 추적자', summary: '발길 닿는 숨은 풍경을 혼자 힘차게 찾아요.', description: '정해진 코스보다 현장의 단서를 따라 움직이며 한적한 자연과 로컬 장면을 온몸으로 발견해요.', strengths: ['낯선 환경에서도 탐색을 즐겨요', '독창적인 여행 장면을 많이 만나요'], caution: '한적한 길에서는 위치 공유, 배터리, 교통편을 미리 확보하세요.', tags: ['비경', '트레킹', '로컬'], contentTypeIds: ['12', '28', '25'], color: '#D36B36', icon: 'navigate' },
  { code: 'SRLT', name: '느긋한 명소 동행자', summary: '그날 끌리는 대표 장소에서 함께 쉬고 웃어요.', description: '빡빡한 계획 없이도 모두가 좋아할 명소를 고르고, 동행과 편안한 속도로 하루를 보내요.', strengths: ['분위기에 맞춰 유연하게 쉬어가요', '누구나 편하게 어울리는 여행을 만들어요'], caution: '대표 명소 한 곳의 운영 시간과 마지막 입장만은 확인하면 좋아요.', tags: ['전망', '카페', '야경'], contentTypeIds: ['12', '39', '14'], color: '#4F86C6', icon: 'people' },
  { code: 'SRLI', name: '바람결 명소 산책자', summary: '마음이 머무는 대표 풍경을 혼자 천천히 걸어요.', description: '정해진 시간표 없이 익숙한 명소와 문화 공간 사이를 거닐며 스스로에게 편안한 여백을 줘요.', strengths: ['현장 컨디션에 맞게 속도를 조절해요', '혼자만의 감상을 편안하게 즐겨요'], caution: '즉흥적으로 오래 머물 때 숙소 귀환 교통편은 놓치지 마세요.', tags: ['산책', '전망', '문화'], contentTypeIds: ['12', '14', '25'], color: '#4C7DA5', icon: 'leaf' },
  { code: 'SRHT', name: '감성 골목 나눔꾼', summary: '우연히 만난 아늑한 장소를 사람들과 즐겨요.', description: '조용한 골목과 카페를 즉흥적으로 발견하고 동행과 다정한 대화를 나누며 쉬어가는 여행자예요.', strengths: ['작은 발견을 따뜻한 추억으로 만들어요', '동행과 편안한 분위기를 잘 나눠요'], caution: '인원이 많다면 작은 공간의 좌석과 영업 여부를 가볍게 확인해주세요.', tags: ['감성골목', '로컬카페', '시장'], contentTypeIds: ['39', '38', '25'], color: '#B56B83', icon: 'heart' },
  { code: 'SRHI', name: '고요한 우연 수집가', summary: '발견한 숨은 공간에서 혼자 천천히 머물러요.', description: '계획표 대신 호기심을 따라 한적한 골목과 작은 공간을 만나고, 조용한 감상을 오래 간직해요.', strengths: ['우연 속에서 자신만의 의미를 찾아요', '부담 없이 깊은 휴식을 누려요'], caution: '너무 외진 곳보다는 이동 정보가 확인되는 범위에서 여유를 즐겨보세요.', tags: ['한적한곳', '골목산책', '작은문화공간'], contentTypeIds: ['25', '14', '39'], color: '#8D6A9F', icon: 'moon' },
] as const;

export const TRAVEL_TYPE_CATALOG = TYPES.map(defineType);

export const TRAVEL_TYPE_BY_CODE = Object.fromEntries(
  TRAVEL_TYPE_CATALOG.map((type) => [type.code, type]),
) as Record<TravelTypeCode, TravelTypeDefinition>;
