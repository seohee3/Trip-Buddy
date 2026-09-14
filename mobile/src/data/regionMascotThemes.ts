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

export type MascotOutfitStyle = 'vest' | 'scarf' | 'sailor' | 'robe';

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
  outfit: MascotOutfitStyle;
  badge: MascotBadgeStyle;
  pattern: MascotPatternStyle;
  propOnLeft: boolean;
  signature: number;
};

// 지역 테마별 주색/보조색 두 쌍. 같은 명도 범위에서 바다·숲·문화·도시의 색을 구분합니다.
export const REGION_MASCOT_THEMES: Record<string, RegionMascotTheme> = {
  '1': {
    areaCode: '1', areaName: '서울특별시', title: '궁궐 지붕과 한강 길찾기',
    description: '궁궐 지붕선, 성문, 한강의 물길, 여행 표지판을 조합한 도심 탐험 테마입니다.',
    motifSummary: '궁궐 지붕 · 성문 · 한강 · 여행 표지판', hat: 'roof', prop: 'sign',
    palette: ['#405475', '#C3A167', '#725681', '#CC9581'], pale: '#EEF0F7',
  },
  '2': {
    areaCode: '2', areaName: '인천광역시', title: '섬과 뱃길 나침반',
    description: '서해의 섬과 섬을 잇는 뱃길을 나침반과 잔잔한 파도로 표현한 테마입니다.',
    motifSummary: '서해 섬 · 뱃길 · 파도 · 나침반', hat: 'islands', prop: 'compass',
    palette: ['#32728D', '#81B9AF', '#3B8794', '#D0B176'], pale: '#EAF5F6',
  },
  '3': {
    areaCode: '3', areaName: '대전광역시', title: '과학 별빛 탐험',
    description: '과학도시의 탐구 분위기를 궤도와 별빛, 작은 관측 도구로 풀어낸 테마입니다.',
    motifSummary: '과학 · 궤도 · 별빛 · 관측', hat: 'orbit', prop: 'telescope',
    palette: ['#465F8D', '#D7B967', '#68548E', '#91BCBD'], pale: '#EFF0F8',
  },
  '4': {
    areaCode: '4', areaName: '대구광역시', title: '팔공산 골목 산책',
    description: '팔공산 능선과 시간의 결이 남은 골목 산책을 산봉우리와 등불로 표현한 테마입니다.',
    motifSummary: '팔공산 · 골목 · 산책 · 등불', hat: 'peak', prop: 'lantern',
    palette: ['#617C4C', '#D0A460', '#96704B', '#B4C78C'], pale: '#F2F3E9',
  },
  '5': {
    areaCode: '5', areaName: '광주광역시', title: '무등산 예술 스케치',
    description: '무등산의 포근한 능선과 도시의 문화예술 공간을 여행 스케치로 담은 테마입니다.',
    motifSummary: '무등산 · 문화예술 · 빛 · 스케치', hat: 'art', prop: 'brush',
    palette: ['#B95F73', '#DFC17B', '#9C6586', '#DF9F85'], pale: '#FBEEF0',
  },
  '6': {
    areaCode: '6', areaName: '부산광역시', title: '파도와 항구 등대',
    description: '부산 바다의 파도, 항구의 움직임, 길을 비추는 등대를 담은 해안 여행 테마입니다.',
    motifSummary: '파도 · 항구 · 등대 · 해안길', hat: 'lighthouse', prop: 'beacon',
    palette: ['#316D9B', '#82C6B9', '#328D9B', '#E3BB79'], pale: '#EAF4FA',
  },
  '7': {
    areaCode: '7', areaName: '울산광역시', title: '태화강 정원 바람',
    description: '태화강의 물길과 국가정원의 잎, 동해 일출의 따뜻한 빛을 조합한 테마입니다.',
    motifSummary: '태화강 · 정원 · 대숲 · 일출', hat: 'garden', prop: 'flower',
    palette: ['#41815F', '#C5C47F', '#4F8F7A', '#DEA776'], pale: '#ECF5ED',
  },
  '8': {
    areaCode: '8', areaName: '세종특별자치시', title: '호수공원 산책 지도',
    description: '도시 속 호수와 공원을 잇는 산책 동선을 물결과 접이식 지도로 표현한 테마입니다.',
    motifSummary: '호수 · 공원 · 산책 · 지도', hat: 'lake', prop: 'map',
    palette: ['#427D80', '#BDD39A', '#5B8D71', '#E2C174'], pale: '#ECF5F2',
  },
  '31': {
    areaCode: '31', areaName: '경기도', title: '숲길과 물길 스탬프',
    description: '경기둘레길의 숲길과 물길을 따라 걷고 여행 스탬프를 모으는 테마입니다.',
    motifSummary: '숲길 · 물길 · 걷기 · 여행 스탬프', hat: 'trail', prop: 'staff',
    palette: ['#637F4D', '#CEAA70', '#4D8272', '#BDD49D'], pale: '#F0F5E9',
  },
  '32': {
    areaCode: '32', areaName: '강원특별자치도', title: '산과 동해 능선 여행',
    description: '높은 산 능선과 동해의 수평선을 함께 걷는 청량한 트레킹 테마입니다.',
    motifSummary: '산 · 동해 · 능선 · 트레킹', hat: 'peak', prop: 'staff',
    palette: ['#3F7969', '#C6B37D', '#5F814A', '#9BBFB7'], pale: '#EAF3ED',
  },
  '33': {
    areaCode: '33', areaName: '충청북도', title: '내륙 호수길 소풍',
    description: '내륙의 산과 호수가 맞닿는 풍경을 잔잔한 물결과 여행 지도로 담은 테마입니다.',
    motifSummary: '내륙 · 호수 · 산 · 산책길', hat: 'lake', prop: 'map',
    palette: ['#437B88', '#B5C98C', '#577F62', '#C4BA7E'], pale: '#ECF4F2',
  },
  '34': {
    areaCode: '34', areaName: '충청남도', title: '서해 노을 바닷길',
    description: '서해의 갯벌과 해안길 위로 번지는 노을을 둥근 해와 바람 소품으로 표현한 테마입니다.',
    motifSummary: '서해 · 갯벌 · 노을 · 해안길', hat: 'sunset', prop: 'pinwheel',
    palette: ['#B56E55', '#E3C17B', '#46868C', '#E3A182'], pale: '#FBF0E9',
  },
  '35': {
    areaCode: '35', areaName: '전북특별자치도', title: '한옥 처마 풍류길',
    description: '한옥의 유연한 처마선과 전통문화 여행의 여유를 부채와 두루마리 무늬로 담은 테마입니다.',
    motifSummary: '한옥 · 전통문화 · 처마 · 풍류', hat: 'hanok', prop: 'fan',
    palette: ['#925B4B', '#CCAD62', '#786040', '#D0A788'], pale: '#F6EFE7',
  },
  '36': {
    areaCode: '36', areaName: '전라남도', title: '다도해 섬바람 항해',
    description: '다도해의 여러 섬과 바다, 갯벌 사이를 천천히 잇는 작은 항해 테마입니다.',
    motifSummary: '다도해 · 섬 · 바다 · 갯벌', hat: 'archipelago', prop: 'sail',
    palette: ['#34858A', '#A4C9B6', '#3F7793', '#DBC48B'], pale: '#EAF5F3',
  },
  '37': {
    areaCode: '37', areaName: '경상북도', title: '천년 지붕 역사길',
    description: '오랜 역사문화와 한옥 지붕, 산과 바다로 이어지는 여행길을 두루마리처럼 표현한 테마입니다.',
    motifSummary: '역사문화 · 한옥 · 산 · 바다', hat: 'heritage', prop: 'scroll',
    palette: ['#8D4958', '#C7A259', '#78594A', '#C3B183'], pale: '#F6ECEB',
  },
  '38': {
    areaCode: '38', areaName: '경상남도', title: '남해 섬정원 산책',
    description: '남해안의 섬과 정원, 파도가 빚은 해안 풍경을 꽃과 여행 지도로 담은 테마입니다.',
    motifSummary: '남해안 · 섬 · 정원 · 파도', hat: 'island-garden', prop: 'flower',
    palette: ['#4D8A74', '#E1AE88', '#5C8660', '#D6CB8C'], pale: '#EEF6EE',
  },
  '39': {
    areaCode: '39', areaName: '제주특별자치도', title: '오름과 돌바람 여행',
    description: '제주의 오름 능선과 바람, 화산섬의 돌길을 바람개비와 둥근 봉우리로 표현한 테마입니다.',
    motifSummary: '오름 · 바람 · 화산섬 · 돌길', hat: 'oreum', prop: 'pinwheel',
    palette: ['#557D53', '#E1AA59', '#397F83', '#E5B976'], pale: '#F1F5E9',
  },
};

const BADGES: MascotBadgeStyle[] = ['round', 'diamond', 'star', 'ticket'];
const PATTERNS: MascotPatternStyle[] = ['dots', 'stripes', 'checks', 'waves'];


// Local variations use only existing regional travel motifs; no official characters.
const OUTFITS: MascotOutfitStyle[] = ['vest', 'scarf', 'sailor', 'robe'];
const REGIONAL_PROPS: Record<string, readonly MascotPropStyle[]> = {
  '1': ['sign', 'scroll', 'stamp'], '2': ['compass', 'sail', 'beacon'],
  '3': ['telescope', 'compass', 'map'], '4': ['lantern', 'staff', 'map'],
  '5': ['brush', 'flower', 'fan'], '6': ['beacon', 'sail', 'compass'],
  '7': ['flower', 'staff', 'pinwheel'], '8': ['map', 'flower', 'pinwheel'],
  '31': ['staff', 'stamp', 'map'], '32': ['staff', 'compass', 'map'],
  '33': ['map', 'staff', 'compass'], '34': ['pinwheel', 'sail', 'compass'],
  '35': ['fan', 'scroll', 'lantern'], '36': ['sail', 'compass', 'beacon'],
  '37': ['scroll', 'lantern', 'stamp'], '38': ['flower', 'sail', 'map'],
  '39': ['pinwheel', 'staff', 'flower'],
};

function tintColor(hex: string, amount: number) {
  const channels = [1, 3, 5].map(offset => {
    const channel = Number.parseInt(hex.slice(offset, offset + 2), 16);
    return Math.round(channel + (255 - channel) * amount).toString(16).padStart(2, '0');
  });
  return '#' + channels.join('');
}

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
  const signature = Number(sigunguCode.split('-').at(-1)) || (seed % 31) + 1;
  const paletteOffset = (signature % 2) * 2;
  const tint = (Math.floor(signature / 2) % 16) / 100;
  const props = REGIONAL_PROPS[areaCode] ?? [theme.prop];
  const costumeOffset = ['2', '6', '36'].includes(areaCode) ? 2
    : ['1', '35', '37'].includes(areaCode) ? 3 : 0;
  const isSuwon = areaCode === '31' && sigunguName === '수원시';

  return {
    theme,
    title: isSuwon ? '수원화성 성곽 스탬프' : theme.title,
    description: isSuwon
      ? '수원화성의 성곽과 성문을 걷고 여행 스탬프를 찍는 모습을 담은 트립버디 창작 테마입니다.'
      : theme.description,
    hat: isSuwon ? 'fortress' : theme.hat,
    prop: isSuwon ? 'stamp' : props[(signature - 1) % props.length],
    primary: tintColor(theme.palette[paletteOffset], tint),
    secondary: tintColor(theme.palette[paletteOffset + 1], tint / 2),
    accent: theme.palette[(paletteOffset + 2) % theme.palette.length],
    pale: theme.pale,
    outfit: isSuwon ? 'robe' : OUTFITS[(Math.floor((signature - 1) / 3) + costumeOffset) % OUTFITS.length],
    badge: BADGES[(seed >>> 3) % BADGES.length],
    pattern: PATTERNS[(seed >>> 5) % PATTERNS.length],
    propOnLeft: ((seed >>> 7) & 1) === 0,
    signature,
  };
}
