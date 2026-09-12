import { getFullRegionName, REGIONS } from '@/src/data/regions';
import { getRegionMascotTheme } from '@/src/data/regionMascotThemes';
import type { Mascot } from '@/src/types/travel';

// 지자체 캐릭터·로고·이미지는 포함하지 않습니다. 시·도 단위 조사 테마와
// 지역 코드 기반 SVG 변형을 연결하기 위한 Trip Buddy 자체 도감 데이터입니다.
export const MASCOTS: Mascot[] = REGIONS.flatMap((area) => {
  const theme = getRegionMascotTheme(area.code);

  return area.sigungus.map((sigungu) => ({
    id: `mascot-${area.code}-${sigungu.code}`,
    areaCode: area.code,
    areaName: area.name,
    sigunguCode: sigungu.code,
    sigunguName: sigungu.name,
    regionName: getFullRegionName(area.name, sigungu.name),
    mascotName: `${sigungu.name} 트립버디`,
    concept: theme.title,
  }));
});
