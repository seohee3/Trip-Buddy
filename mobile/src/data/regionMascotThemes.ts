export type MascotHatStyle =
  | 'roof'
  | 'islands'
  | 'orbit'
  | 'peak'
  | 'art'
  | 'lighthouse'
  | 'garden'
  | 'lake'
  | 'trail'
  | 'sunset'
  | 'hanok'
  | 'archipelago'
  | 'heritage'
  | 'island-garden'
  | 'oreum'
  | 'fortress';

export type MascotPropStyle =
  | 'sign'
  | 'compass'
  | 'telescope'
  | 'lantern'
  | 'brush'
  | 'beacon'
  | 'flower'
  | 'map'
  | 'staff'
  | 'stamp'
  | 'fan'
  | 'sail'
  | 'scroll'
  | 'pinwheel';

export type MascotBadgeStyle = 'round' | 'diamond' | 'star' | 'ticket';
export type MascotPatternStyle = 'dots' | 'stripes' | 'checks' | 'waves';

export type RegionMascotTheme = {
  areaCode: string;
  areaName: string;
  title: string;
  description: string;
  motifSummary: string;
  hat: MascotHatStyle;
  prop: MascotPropStyle;
  palette: readonly [string, string, string, string];
  pale: string;
};

export type RegionMascotLook = {
  theme: RegionMascotTheme;
  title: string;
  description: string;
  hat: MascotHatStyle;
  prop: MascotPropStyle;
  primary: string;
  secondary: string;
  accent: string;
  pale: string;
  badge: MascotBadgeStyle;
  pattern: MascotPatternStyle;
  propOnLeft: boolean;
  signature: number;
};

// 아래 색은 지자체 색상 체계가 아니라 Trip Buddy 보라색 UI와 어울리도록 만든 창작 팔레트입니다.
export const REGION_MASCOT_THEMES: Record<string, RegionMascotTheme> = {
  '1': {
    areaCode: '1', areaName: '서울특별시', title: '궁궐 지붕과 한강 길찾기',
    description: '궁궐 지붕선, 성문, 한강의 물길, 여행 표지판을 조합한 도심 탐험 테마입니다.',
    motifSummary: '궁궐 지붕 · 성문 · 한강 · 여행 표지판', hat: 'roof', prop: 'sign',
    palette: ['#7667D9', '#5C7DC9', '#4F9AA8', '#A56CB5'], pale: '#EEEAFE',
  },
  '2': {
    areaCode: '2', areaName: '인천광역시', title: '섬과 뱃길 나침반',
    description: '서해의 섬과 섬을 잇는 뱃길을 나침반과 잔잔한 파도로 표현한 테마입니다.',
    motifSummary: '서해 섬 · 뱃길 · 파도 · 나침반', hat: 'islands', prop: 'compass',
    palette: ['#397DA4', '#53A3A5', '#6576C8', '#5C8C72'], pale: '#E5F4F7',
  },
  '3': {
    areaCode: '3', areaName: '대전광역시', title: '과학 별빛 탐험',
    description: '과학도시의 탐구 분위기를 궤도와 별빛, 작은 관측 도구로 풀어낸 테마입니다.',
    motifSummary: '과학 · 궤도 · 별빛 · 관측', hat: 'orbit', prop: 'telescope',
    palette: ['#6256C7', '#466FC2', '#8B5FB5', '#3B8A91'], pale: '#ECEBFF',
  },
  '4': {
    areaCode: '4', areaName: '대구광역시', title: '팔공산 골목 산책',
    description: '팔공산 능선과 시간의 결이 남은 골목 산책을 산봉우리와 등불로 표현한 테마입니다.',
    motifSummary: '팔공산 · 골목 · 산책 · 등불', hat: 'peak', prop: 'lantern',
    palette: ['#6F8753', '#A46D55', '#8067B0', '#B2804D'], pale: '#F1F2E6',
  },
  '5': {
    areaCode: '5', areaName: '광주광역시', title: '무등산 예술 스케치',
    description: '무등산의 포근한 능선과 도시의 문화예술 공간을 여행 스케치로 담은 테마입니다.',
    motifSummary: '무등산 · 문화예술 · 빛 · 스케치', hat: 'art', prop: 'brush',
    palette: ['#8C62B0', '#B06583', '#5D8D8A', '#796BC0'], pale: '#F5EAF6',
  },
  '6': {
    areaCode: '6', areaName: '부산광역시', title: '파도와 항구 등대',
    description: '부산 바다의 파도, 항구의 움직임, 길을 비추는 등대를 담은 해안 여행 테마입니다.',
    motifSummary: '파도 · 항구 · 등대 · 해안길', hat: 'lighthouse', prop: 'beacon',
    palette: ['#347FAA', '#496DC0', '#3D9A92', '#7A67B5'], pale: '#E6F3FB',
  },
  '7': {
    areaCode: '7', areaName: '울산광역시', title: '태화강 정원 바람',
    description: '태화강의 물길과 국가정원의 잎, 동해 일출의 따뜻한 빛을 조합한 테마입니다.',
    motifSummary: '태화강 · 정원 · 대숲 · 일출', hat: 'garden', prop: 'flower',
    palette: ['#4B956E', '#5A8C9B', '#8A7A55', '#6F72B9'], pale: '#EAF6EC',
  },
  '8': {
    areaCode: '8', areaName: '세종특별자치시', title: '호수공원 산책 지도',
    description: '도시 속 호수와 공원을 잇는 산책 동선을 물결과 접이식 지도로 표현한 테마입니다.',
    motifSummary: '호수 · 공원 · 산책 · 지도', hat: 'lake', prop: 'map',
    palette: ['#4E8EA1', '#6375BD', '#5D9A75', '#8B69AD'], pale: '#E8F4F5',
  },
  '31': {
    areaCode: '31', areaName: '경기도', title: '숲길과 물길 스탬프',
    description: '경기둘레길의 숲길과 물길을 따라 걷고 여행 스탬프를 모으는 테마입니다.',
    motifSummary: '숲길 · 물길 · 걷기 · 여행 스탬프', hat: 'trail', prop: 'staff',
    palette: ['#638454', '#4E8493', '#7A69B7', '#9A7657'], pale: '#EEF3E8',
  },
  '32': {
    areaCode: '32', areaName: '강원특별자치도', title: '산과 동해 능선 여행',
    description: '높은 산 능선과 동해의 수평선을 함께 걷는 청량한 트레킹 테마입니다.',
    motifSummary: '산 · 동해 · 능선 · 트레킹', hat: 'peak', prop: 'staff',
    palette: ['#527C72', '#477EA1', '#75834E', '#6D6DB1'], pale: '#E8F2EF',
  },
  '33': {
    areaCode: '33', areaName: '충청북도', title: '내륙 호수길 소풍',
    description: '내륙의 산과 호수가 맞닿는 풍경을 잔잔한 물결과 여행 지도로 담은 테마입니다.',
    motifSummary: '내륙 · 호수 · 산 · 산책길', hat: 'lake', prop: 'map',
    palette: ['#4E8C94', '#5B7AB2', '#6C8B5C', '#8270A8'], pale: '#E9F4F2',
  },
  '34': {
    areaCode: '34', areaName: '충청남도', title: '서해 노을 바닷길',
    description: '서해의 갯벌과 해안길 위로 번지는 노을을 둥근 해와 바람 소품으로 표현한 테마입니다.',
    motifSummary: '서해 · 갯벌 · 노을 · 해안길', hat: 'sunset', prop: 'pinwheel',
    palette: ['#B27269', '#8D6DAA', '#527F98', '#B18455'], pale: '#FAECE8',
  },
  '35': {
    areaCode: '35', areaName: '전북특별자치도', title: '한옥 처마 풍류길',
    description: '한옥의 유연한 처마선과 전통문화 여행의 여유를 부채와 두루마리 무늬로 담은 테마입니다.',
    motifSummary: '한옥 · 전통문화 · 처마 · 풍류', hat: 'hanok', prop: 'fan',
    palette: ['#8E6659', '#6F805A', '#7564A9', '#A17E52'], pale: '#F5EDE8',
  },
  '36': {
    areaCode: '36', areaName: '전라남도', title: '다도해 섬바람 항해',
    description: '다도해의 여러 섬과 바다, 갯벌 사이를 천천히 잇는 작은 항해 테마입니다.',
    motifSummary: '다도해 · 섬 · 바다 · 갯벌', hat: 'archipelago', prop: 'sail',
    palette: ['#418A91', '#4E78A5', '#5D8A6B', '#786EB0'], pale: '#E6F3F2',
  },
  '37': {
    areaCode: '37', areaName: '경상북도', title: '천년 지붕 역사길',
    description: '오랜 역사문화와 한옥 지붕, 산과 바다로 이어지는 여행길을 두루마리처럼 표현한 테마입니다.',
    motifSummary: '역사문화 · 한옥 · 산 · 바다', hat: 'heritage', prop: 'scroll',
    palette: ['#7C6A54', '#697C58', '#6E6BA7', '#9A744F'], pale: '#F2EEE5',
  },
  '38': {
    areaCode: '38', areaName: '경상남도', title: '남해 섬정원 산책',
    description: '남해안의 섬과 정원, 파도가 빚은 해안 풍경을 꽃과 여행 지도로 담은 테마입니다.',
    motifSummary: '남해안 · 섬 · 정원 · 파도', hat: 'island-garden', prop: 'flower',
    palette: ['#478B7C', '#557FA1', '#71875A', '#8B6CA8'], pale: '#E7F4EF',
  },
  '39': {
    areaCode: '39', areaName: '제주특별자치도', title: '오름과 돌바람 여행',
    description: '제주의 오름 능선과 바람, 화산섬의 돌길을 바람개비와 둥근 봉우리로 표현한 테마입니다.',
    motifSummary: '오름 · 바람 · 화산섬 · 돌길', hat: 'oreum', prop: 'pinwheel',
    palette: ['#5D815E', '#4F8490', '#7668AA', '#8C725A'], pale: '#EDF3E8',
  },
};

const BADGES: MascotBadgeStyle[] = ['round', 'diamond', 'star', 'ticket'];
const PATTERNS: MascotPatternStyle[] = ['dots', 'stripes', 'checks', 'waves'];

function hashRegion(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getRegionMascotTheme(areaCode: string) {
  return REGION_MASCOT_THEMES[areaCode] ?? REGION_MASCOT_THEMES['1'];
}

export function getRegionMascotLook(areaCode: string, sigunguCode: string, sigunguName: string): RegionMascotLook {
  const theme = getRegionMascotTheme(areaCode);
  const seed = hashRegion(`${areaCode}:${sigunguCode}:${sigunguName}`);
  const paletteOffset = seed % theme.palette.length;
  const isSuwon = areaCode === '31' && sigunguName === '수원시';

  return {
    theme,
    title: isSuwon ? '수원화성 성곽 스탬프' : theme.title,
    description: isSuwon
      ? '수원화성의 성곽과 성문을 걷고 여행 스탬프를 찍는 모습을 담은 트립버디 창작 테마입니다.'
      : theme.description,
    hat: isSuwon ? 'fortress' : theme.hat,
    prop: isSuwon ? 'stamp' : theme.prop,
    primary: theme.palette[paletteOffset],
    secondary: theme.palette[(paletteOffset + 1) % theme.palette.length],
    accent: theme.palette[(paletteOffset + 2) % theme.palette.length],
    pale: theme.pale,
    badge: BADGES[(seed >>> 3) % BADGES.length],
    pattern: PATTERNS[(seed >>> 5) % PATTERNS.length],
    propOnLeft: ((seed >>> 7) & 1) === 0,
    signature: Number(sigunguCode.split('-').at(-1)) || (seed % 31) + 1,
  };
}
