export type RegionSigungu = {
  code: string;
  name: string;
};

export type RegionArea = {
  code: string;
  name: string;
  sigungus: RegionSigungu[];
};

export const ALL_SIGUNGU_CODE = 'all';

const sigungus = (areaCode: string, names: string[]): RegionSigungu[] =>
  names.map((name, index) => ({
    code: `${areaCode}-${String(index + 1).padStart(3, '0')}`,
    name,
  }));

export const REGIONS: RegionArea[] = [
  { code: '1', name: '서울특별시', sigungus: sigungus('1', ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구']) },
  { code: '2', name: '인천광역시', sigungus: sigungus('2', ['중구', '동구', '미추홀구', '연수구', '남동구', '부평구', '계양구', '서구', '강화군', '옹진군']) },
  { code: '3', name: '대전광역시', sigungus: sigungus('3', ['동구', '중구', '서구', '유성구', '대덕구']) },
  { code: '4', name: '대구광역시', sigungus: sigungus('4', ['중구', '동구', '서구', '남구', '북구', '수성구', '달서구', '달성군']) },
  { code: '5', name: '광주광역시', sigungus: sigungus('5', ['동구', '서구', '남구', '북구', '광산구']) },
  { code: '6', name: '부산광역시', sigungus: sigungus('6', ['중구', '서구', '동구', '영도구', '부산진구', '동래구', '남구', '북구', '해운대구', '사하구', '금정구', '강서구', '연제구', '수영구', '사상구', '기장군']) },
  { code: '7', name: '울산광역시', sigungus: sigungus('7', ['중구', '남구', '동구', '북구', '울주군']) },
  { code: '8', name: '세종특별자치시', sigungus: sigungus('8', ['세종시']) },
  { code: '31', name: '경기도', sigungus: sigungus('31', ['수원시', '성남시', '의정부시', '안양시', '부천시', '광명시', '평택시', '동두천시', '안산시', '고양시', '과천시', '구리시', '남양주시', '오산시', '시흥시', '군포시', '의왕시', '하남시', '용인시', '파주시', '이천시', '안성시', '김포시', '화성시', '광주시', '양주시', '포천시', '여주시', '연천군', '가평군', '양평군']) },
  { code: '32', name: '강원특별자치도', sigungus: sigungus('32', ['춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시', '홍천군', '횡성군', '영월군', '평창군', '정선군', '철원군', '화천군', '양구군', '인제군', '고성군', '양양군']) },
  { code: '33', name: '충청북도', sigungus: sigungus('33', ['청주시', '충주시', '제천시', '보은군', '옥천군', '영동군', '증평군', '진천군', '괴산군', '음성군', '단양군']) },
  { code: '34', name: '충청남도', sigungus: sigungus('34', ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시', '금산군', '부여군', '서천군', '청양군', '홍성군', '예산군', '태안군']) },
  { code: '35', name: '전북특별자치도', sigungus: sigungus('35', ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시', '완주군', '진안군', '무주군', '장수군', '임실군', '순창군', '고창군', '부안군']) },
  { code: '36', name: '전라남도', sigungus: sigungus('36', ['목포시', '여수시', '순천시', '나주시', '광양시', '담양군', '곡성군', '구례군', '고흥군', '보성군', '화순군', '장흥군', '강진군', '해남군', '영암군', '무안군', '함평군', '영광군', '장성군', '완도군', '진도군', '신안군']) },
  { code: '37', name: '경상북도', sigungus: sigungus('37', ['포항시', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시', '문경시', '경산시', '의성군', '청송군', '영양군', '영덕군', '청도군', '고령군', '성주군', '칠곡군', '예천군', '봉화군', '울진군', '울릉군']) },
  { code: '38', name: '경상남도', sigungus: sigungus('38', ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시', '의령군', '함안군', '창녕군', '고성군', '남해군', '하동군', '산청군', '함양군', '거창군', '합천군']) },
  { code: '39', name: '제주특별자치도', sigungus: sigungus('39', ['제주시', '서귀포시']) },
];

export const REGION_NAMES = REGIONS.map((region) => region.name);

export function getRegionByCode(areaCode: string) {
  return REGIONS.find((region) => region.code === areaCode);
}

export function getRegionByName(areaName: string) {
  return REGIONS.find((region) => region.name === areaName);
}

export function getSigunguByCode(areaCode: string, sigunguCode: string) {
  return getRegionByCode(areaCode)?.sigungus.find((sigungu) => sigungu.code === sigunguCode);
}

export function getFullRegionName(areaName: string, sigunguName?: string) {
  if (!sigunguName || sigunguName === '전체' || areaName === sigunguName) return areaName;
  return `${areaName} ${sigunguName}`;
}

export function findRegionSelection(regionName: string) {
  const exactArea = getRegionByName(regionName);
  if (exactArea) return { area: exactArea, sigungu: undefined };

  for (const area of REGIONS) {
    const sigungu = area.sigungus.find(
      (item) => getFullRegionName(area.name, item.name) === regionName || item.name === regionName,
    );
    if (sigungu) return { area, sigungu };
  }

  return undefined;
}
