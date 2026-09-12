const TOUR_API_KEY = "a2652d41b57533048e6566c0afca1ba6f190d1706286e228c74f843544f8d3a8";

let selectedAreaCode = "1";
let selectedAreaName = "서울특별시";
let tempAreaCode = "1";
let tempAreaName = "서울특별시";

let selectedSigunguCode = "";
let selectedSigunguName = "전체";
let tempSigunguCode = "";
let tempSigunguName = "전체";

let selectedContentTypeId = "";

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const searchGrid = document.getElementById("searchGrid");
const searchList = document.getElementById("searchList");
const loadingText = document.getElementById("loadingText");

const areaList = [
  { code: "1", name: "서울특별시" },
  { code: "2", name: "인천광역시" },
  { code: "3", name: "대전광역시" },
  { code: "4", name: "대구광역시" },
  { code: "5", name: "광주광역시" },
  { code: "6", name: "부산광역시" },
  { code: "7", name: "울산광역시" },
  { code: "8", name: "세종특별자치시" },
  { code: "31", name: "경기도" },
  { code: "32", name: "강원특별자치도" },
  { code: "33", name: "충청북도" },
  { code: "34", name: "충청남도" },
  { code: "35", name: "경상북도" },
  { code: "36", name: "경상남도" },
  { code: "37", name: "전북특별자치도" },
  { code: "38", name: "전라남도" },
  { code: "39", name: "제주특별자치도" }
];

const sigunguList = {
  "1": [
    { code: "", name: "전체" },
    { code: "1", name: "강남구" },
    { code: "2", name: "강동구" },
    { code: "3", name: "강북구" },
    { code: "4", name: "강서구" },
    { code: "5", name: "관악구" },
    { code: "6", name: "광진구" },
    { code: "7", name: "구로구" },
    { code: "8", name: "금천구" },
    { code: "9", name: "노원구" },
    { code: "10", name: "도봉구" },
    { code: "11", name: "동대문구" },
    { code: "12", name: "동작구" },
    { code: "13", name: "마포구" },
    { code: "14", name: "서대문구" },
    { code: "15", name: "서초구" },
    { code: "16", name: "성동구" },
    { code: "17", name: "성북구" },
    { code: "18", name: "송파구" },
    { code: "19", name: "양천구" },
    { code: "20", name: "영등포구" },
    { code: "21", name: "용산구" },
    { code: "22", name: "은평구" },
    { code: "23", name: "종로구" },
    { code: "24", name: "중구" },
    { code: "25", name: "중랑구" }
  ],
  "2": [
    { code: "", name: "전체" },
    { code: "1", name: "강화군" },
    { code: "2", name: "계양구" },
    { code: "3", name: "미추홀구" },
    { code: "4", name: "남동구" },
    { code: "5", name: "동구" },
    { code: "6", name: "부평구" },
    { code: "7", name: "서구" },
    { code: "8", name: "연수구" },
    { code: "9", name: "옹진군" },
    { code: "10", name: "중구" }
  ],
  "3": [
    { code: "", name: "전체" },
    { code: "1", name: "대덕구" },
    { code: "2", name: "동구" },
    { code: "3", name: "서구" },
    { code: "4", name: "유성구" },
    { code: "5", name: "중구" }
  ],
  "4": [
    { code: "", name: "전체" },
    { code: "1", name: "남구" },
    { code: "2", name: "달서구" },
    { code: "3", name: "달성군" },
    { code: "4", name: "동구" },
    { code: "5", name: "북구" },
    { code: "6", name: "서구" },
    { code: "7", name: "수성구" },
    { code: "8", name: "중구" }
  ],
  "5": [
    { code: "", name: "전체" },
    { code: "1", name: "광산구" },
    { code: "2", name: "남구" },
    { code: "3", name: "동구" },
    { code: "4", name: "북구" },
    { code: "5", name: "서구" }
  ],
  "6": [
    { code: "", name: "전체" },
    { code: "1", name: "강서구" },
    { code: "2", name: "금정구" },
    { code: "3", name: "기장군" },
    { code: "4", name: "남구" },
    { code: "5", name: "동구" },
    { code: "6", name: "동래구" },
    { code: "7", name: "부산진구" },
    { code: "8", name: "북구" },
    { code: "9", name: "사상구" },
    { code: "10", name: "사하구" },
    { code: "11", name: "서구" },
    { code: "12", name: "수영구" },
    { code: "13", name: "연제구" },
    { code: "14", name: "영도구" },
    { code: "15", name: "중구" },
    { code: "16", name: "해운대구" }
  ],
  "7": [
    { code: "", name: "전체" },
    { code: "1", name: "중구" },
    { code: "2", name: "남구" },
    { code: "3", name: "동구" },
    { code: "4", name: "북구" },
    { code: "5", name: "울주군" }
  ],
  "8": [
    { code: "", name: "전체" }
  ],
  "31": [
    { code: "", name: "전체" },
    { code: "1", name: "가평군" },
    { code: "2", name: "고양시" },
    { code: "3", name: "과천시" },
    { code: "4", name: "광명시" },
    { code: "5", name: "광주시" },
    { code: "6", name: "구리시" },
    { code: "7", name: "군포시" },
    { code: "8", name: "김포시" },
    { code: "9", name: "남양주시" },
    { code: "10", name: "동두천시" },
    { code: "11", name: "부천시" },
    { code: "12", name: "성남시" },
    { code: "13", name: "수원시" },
    { code: "14", name: "시흥시" },
    { code: "15", name: "안산시" },
    { code: "16", name: "안성시" },
    { code: "17", name: "안양시" },
    { code: "18", name: "양주시" },
    { code: "19", name: "양평군" },
    { code: "20", name: "여주시" },
    { code: "21", name: "연천군" },
    { code: "22", name: "오산시" },
    { code: "23", name: "용인시" },
    { code: "24", name: "의왕시" },
    { code: "25", name: "의정부시" },
    { code: "26", name: "이천시" },
    { code: "27", name: "파주시" },
    { code: "28", name: "평택시" },
    { code: "29", name: "포천시" },
    { code: "30", name: "하남시" },
    { code: "31", name: "화성시" }
  ],
  "32": [
    { code: "", name: "전체" },
    { code: "1", name: "강릉시" },
    { code: "2", name: "고성군" },
    { code: "3", name: "동해시" },
    { code: "4", name: "삼척시" },
    { code: "5", name: "속초시" },
    { code: "6", name: "양구군" },
    { code: "7", name: "양양군" },
    { code: "8", name: "영월군" },
    { code: "9", name: "원주시" },
    { code: "10", name: "인제군" },
    { code: "11", name: "정선군" },
    { code: "12", name: "철원군" },
    { code: "13", name: "춘천시" },
    { code: "14", name: "태백시" },
    { code: "15", name: "평창군" },
    { code: "16", name: "홍천군" },
    { code: "17", name: "화천군" },
    { code: "18", name: "횡성군" }
  ],
  "39": [
    { code: "", name: "전체" },
    { code: "1", name: "서귀포시" },
    { code: "2", name: "제주시" }
  ]
};

async function loadSearchPlaces() {
  const keyword = searchInput.value.trim();

  searchGrid.innerHTML = "";
  searchList.innerHTML = "";

  loadingText.style.display = "block";
  loadingText.textContent = "불러오는 중...";

  let url = "";

  if (keyword) {
    url =
      `https://apis.data.go.kr/B551011/KorService2/searchKeyword2` +
      `?serviceKey=${TOUR_API_KEY}` +
      `&MobileOS=ETC` +
      `&MobileApp=TripBuddy` +
      `&_type=json` +
      `&keyword=${encodeURIComponent(keyword)}` +
      `&areaCode=${selectedAreaCode}` +
      `&numOfRows=20` +
      `&pageNo=1`;
  } else {
    url =
      `https://apis.data.go.kr/B551011/KorService2/areaBasedList2` +
      `?serviceKey=${TOUR_API_KEY}` +
      `&MobileOS=ETC` +
      `&MobileApp=TripBuddy` +
      `&_type=json` +
      `&areaCode=${selectedAreaCode}` +
      `&arrange=Q` +
      `&numOfRows=20` +
      `&pageNo=1`;
  }

  if (selectedContentTypeId) {
    url += `&contentTypeId=${selectedContentTypeId}`;
  }

  if (selectedSigunguCode) {
    url += `&sigunguCode=${selectedSigunguCode}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log("검색 결과:", data);

    const rawItems = data.response?.body?.items?.item || [];
    const places = Array.isArray(rawItems) ? rawItems : [rawItems];

    loadingText.style.display = "none";

    if (!rawItems || places.length === 0) {
      searchGrid.innerHTML = `<p class="empty-text">검색 결과가 없습니다.</p>`;
      return;
    }

    if (selectedContentTypeId === "") {
      searchGrid.classList.remove("hidden");
      searchList.classList.add("hidden");
      renderGrid(places.slice(0, 6));
    } else {
      searchGrid.classList.add("hidden");
      searchList.classList.remove("hidden");
      renderList(places);
    }
  } catch (error) {
    console.error(error);
    loadingText.textContent = "검색 결과를 불러오지 못했습니다.";
  }
}

function renderGrid(places) {
  searchGrid.innerHTML = "";

  places.forEach((place) => {
    const image = place.firstimage || "https://via.placeholder.com/300x220?text=No+Image";
    const title = place.title || "이름 없음";
    const address = place.addr1 || "주소 정보 없음";

    const card = document.createElement("div");
    card.className = "search-card";

    card.innerHTML = `
      <img src="${image}" alt="${title}" />
      <div>
        <h4>${title}</h4>
        <p>${address}</p>
      </div>
    `;

    searchGrid.appendChild(card);
  });
}

function renderList(places) {
  searchList.innerHTML = "";

  places.forEach((place, index) => {
    const image = place.firstimage || "https://via.placeholder.com/120x90?text=No+Image";
    const title = place.title || "이름 없음";
    const address = place.addr1 || "주소 정보 없음";

    const card = document.createElement("div");
    card.className = "list-card";

    card.innerHTML = `
      <img src="${image}" alt="${title}" />
      <div>
        <h4>${title}</h4>
        <p>${address}</p>
        <span>⭐ ${(4.5 + index * 0.03).toFixed(1)} · ${(2.0 + index * 0.4).toFixed(1)}km</span>
      </div>
    `;

    searchList.appendChild(card);
  });
}

function renderAreaDropdown() {
  const areaDropdownList = document.getElementById("areaDropdownList");
  areaDropdownList.innerHTML = "";

  areaList.forEach((area) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = area.name;

    if (area.code === tempAreaCode) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      tempAreaCode = area.code;
      tempAreaName = area.name;

      tempSigunguCode = "";
      tempSigunguName = "전체";

      document.getElementById("areaDropdownText").textContent = tempAreaName;
      document.getElementById("sigunguDropdownText").textContent = tempSigunguName;

      renderAreaDropdown();
      renderSigunguDropdown();

      areaDropdownList.classList.add("hidden");
    });

    areaDropdownList.appendChild(button);
  });
}

function renderSigunguDropdown() {
  const sigunguDropdownList = document.getElementById("sigunguDropdownList");
  sigunguDropdownList.innerHTML = "";

  const list = sigunguList[tempAreaCode] || [{ code: "", name: "전체" }];

  list.forEach((sigungu) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = sigungu.name;

    if (sigungu.code === tempSigunguCode) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      tempSigunguCode = sigungu.code;
      tempSigunguName = sigungu.name;

      document.getElementById("sigunguDropdownText").textContent = tempSigunguName;

      renderSigunguDropdown();

      sigunguDropdownList.classList.add("hidden");
    });

    sigunguDropdownList.appendChild(button);
  });
}

document.querySelectorAll(".category").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".category").forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");
    selectedContentTypeId = button.dataset.type;

    loadSearchPlaces();
  });
});

searchBtn.addEventListener("click", loadSearchPlaces);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    loadSearchPlaces();
  }
});

document.getElementById("regionBtn").addEventListener("click", () => {
  document.getElementById("regionModal").classList.remove("hidden");

  tempAreaCode = selectedAreaCode;
  tempAreaName = selectedAreaName;
  tempSigunguCode = selectedSigunguCode;
  tempSigunguName = selectedSigunguName;

  document.getElementById("areaDropdownText").textContent = tempAreaName;
  document.getElementById("sigunguDropdownText").textContent = tempSigunguName;

  renderAreaDropdown();
  renderSigunguDropdown();
});

document.getElementById("closeRegionBtn").addEventListener("click", closeRegionModal);
document.getElementById("cancelRegionBtn").addEventListener("click", closeRegionModal);

function closeRegionModal() {
  document.getElementById("regionModal").classList.add("hidden");
  document.getElementById("areaDropdownList").classList.add("hidden");
  document.getElementById("sigunguDropdownList").classList.add("hidden");
}

document.getElementById("areaDropdownBtn").addEventListener("click", () => {
  document.getElementById("areaDropdownList").classList.toggle("hidden");
  document.getElementById("sigunguDropdownList").classList.add("hidden");
});

document.getElementById("sigunguDropdownBtn").addEventListener("click", () => {
  document.getElementById("sigunguDropdownList").classList.toggle("hidden");
  document.getElementById("areaDropdownList").classList.add("hidden");
});

document.getElementById("applyRegionBtn").addEventListener("click", () => {
  selectedAreaCode = tempAreaCode;
  selectedAreaName = tempAreaName;

  selectedSigunguCode = tempSigunguCode;
  selectedSigunguName = tempSigunguName;

  if (selectedSigunguName === "전체") {
    document.getElementById("selectedRegionText").textContent = selectedAreaName;
  } else {
    document.getElementById("selectedRegionText").textContent =
      `${selectedAreaName} ${selectedSigunguName}`;
  }

  closeRegionModal();
  loadSearchPlaces();
});

renderAreaDropdown();
renderSigunguDropdown();

window.addEventListener("load", loadSearchPlaces);