import type { Mascot } from '@/src/types/travel';
import { getFullRegionName, REGIONS } from '@/src/data/regions';

// 지역의 자연·생활 풍경만 모티브로 삼은 오리지널 도감 데이터입니다.
// 실제 지자체 캐릭터, 로고, 명칭을 사용하지 않으며 이미지는 교체 가능한 placeholder입니다.
const AREA_MOTIFS: Record<string, string> = {
  서울특별시: '도시의 빛과 골목 산책',
  인천광역시: '바닷바람과 항구의 움직임',
  대전광역시: '차분한 과학 탐험',
  대구광역시: '따뜻한 햇살과 활기찬 거리',
  광주광역시: '빛과 예술이 흐르는 하루',
  부산광역시: '파도와 언덕길의 리듬',
  울산광역시: '푸른 바다와 넓은 숲',
  세종특별자치시: '느긋한 공원과 책 산책',
  경기도: '도시와 자연 사이의 주말 여행',
  강원특별자치도: '산바람과 맑은 계곡',
  충청북도: '호수와 들판의 느린 호흡',
  충청남도: '갯벌과 들녘의 풍경',
  전북특별자치도: '맛과 오래된 길의 기억',
  전라남도: '섬과 남쪽 바다의 여유',
  경상북도: '고즈넉한 길과 깊은 숲',
  경상남도: '섬진강 물결과 바닷길',
  제주특별자치도: '바람과 화산 돌담의 여행',
};

export const MASCOTS: Mascot[] = REGIONS.flatMap((area) =>
  area.sigungus.map((sigungu) => {
    const regionName = getFullRegionName(area.name, sigungu.name);
    return {
      id: `mascot-${area.code}-${sigungu.code}`,
      regionName,
      mascotName: `${sigungu.name} 길동무`,
      concept: `${AREA_MOTIFS[area.name] ?? '지역의 일상 풍경'}를 담은 오리지널 여행 친구`,
      image: `https://placehold.co/240x240/EDE7FF/5C3DFF?text=${encodeURIComponent(sigungu.name)}`,
    };
  }),
);
