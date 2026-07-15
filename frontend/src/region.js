const REGION_NAMES = [
  "서울특별시",
  "부산광역시",
  "대구광역시",
  "인천광역시",
  "광주광역시",
  "대전광역시",
  "울산광역시",
  "세종특별자치시",
  "경기도",
  "강원특별자치도",
  "충청북도",
  "충청남도",
  "전북특별자치도",
  "전라남도",
  "경상북도",
  "경상남도",
  "제주특별자치도",
];

const REGION_NAME_ALIASES = {
  강원도: "강원특별자치도",
  전라북도: "전북특별자치도",
  제주도: "제주특별자치도",
  서울: "서울특별시",
  부산: "부산광역시",
  대구: "대구광역시",
  인천: "인천광역시",
  광주: "광주광역시",
  대전: "대전광역시",
  울산: "울산광역시",
  세종: "세종특별자치시",
  경기: "경기도",
  강원: "강원특별자치도",
  충북: "충청북도",
  충남: "충청남도",
  전북: "전북특별자치도",
  전남: "전라남도",
  경북: "경상북도",
  경남: "경상남도",
  제주: "제주특별자치도",
};

function normalizeRegionName(region) {
  if (!region || typeof region !== "string") {
    return "";
  }

  const trimmedRegion = region.trim();

  if (REGION_NAMES.includes(trimmedRegion)) {
    return trimmedRegion;
  }

  if (REGION_NAME_ALIASES[trimmedRegion]) {
    return REGION_NAME_ALIASES[trimmedRegion];
  }

  const matchedRegion = REGION_NAMES.find((regionName) =>
    trimmedRegion.includes(regionName)
  );

  if (matchedRegion) {
    return matchedRegion;
  }

  const matchedAlias = Object.keys(REGION_NAME_ALIASES).find((alias) =>
    trimmedRegion.includes(alias)
  );

  return matchedAlias ? REGION_NAME_ALIASES[matchedAlias] : trimmedRegion;
}

function getRegionCounts(records = []) {
  const counts = Object.fromEntries(
    REGION_NAMES.map((regionName) => [regionName, 0])
  );

  records.forEach((record) => {
    const regionName = normalizeRegionName(record?.region);

    if (!regionName) return;

    if (!(regionName in counts)) {
      counts[regionName] = 0;
    }

    counts[regionName] += 1;
  });

  return counts;
}

function getVisitedRegions(records = []) {
  const counts = getRegionCounts(records);

  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort((first, second) => {
      const countDifference = second[1] - first[1];

      if (countDifference !== 0) {
        return countDifference;
      }

      return first[0].localeCompare(second[0], "ko");
    })
    .map(([region, count]) => ({
      region,
      count,
    }));
}

function getMostVisitedRegion(records = []) {
  const visitedRegions = getVisitedRegions(records);

  return visitedRegions[0] || {
    region: "",
    count: 0,
  };
}

function getTopRegions(records = [], limit = 3) {
  return getVisitedRegions(records).slice(0, limit);
}

function getRecentRegion(records = []) {
  const recentRecord = records.find((record) => record?.region);

  if (!recentRecord) {
    return {
      region: "",
      date: "",
    };
  }

  return {
    region: normalizeRegionName(recentRecord.region),
    date: recentRecord.date || "",
  };
}

function getVisitedRegionCount(records = []) {
  return getVisitedRegions(records).length;
}

function getVisitLevel(count) {
  if (count >= 4) return 3;
  if (count >= 2) return 2;
  if (count >= 1) return 1;
  return 0;
}
window.REGION_NAMES = REGION_NAMES;
window.normalizeRegionName = normalizeRegionName;
window.getRegionCounts = getRegionCounts;
window.getVisitedRegions = getVisitedRegions;
window.getMostVisitedRegion = getMostVisitedRegion;
window.getTopRegions = getTopRegions;
window.getRecentRegion = getRecentRegion;
window.getVisitedRegionCount = getVisitedRegionCount;
window.getVisitLevel = getVisitLevel;

console.log("region.js loaded:", typeof window.getRegionCounts);