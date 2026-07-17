const TOUR_API_KEY = "a2652d41b57533048e6566c0afca1ba6f190d1706286e228c74f843544f8d3a8";
const screens = document.querySelectorAll(".screen");
let nearbyPlaces = [];
let selectedPlace = null;
const MASCOT_DATA = [
  {
    region: "서울특별시",
    shortName: "서울",
    icon: "🐯",
    name: "서울 호랑이",
  },
  {
    region: "부산광역시",
    shortName: "부산",
    icon: "🐦",
    name: "부산 갈매기",
  },
  {
    region: "대구광역시",
    shortName: "대구",
    icon: "🦁",
    name: "대구 사자",
  },
  {
    region: "인천광역시",
    shortName: "인천",
    icon: "✈️",
    name: "인천 여행새",
  },
  {
    region: "광주광역시",
    shortName: "광주",
    icon: "🦋",
    name: "광주 나비",
  },
  {
    region: "대전광역시",
    shortName: "대전",
    icon: "🌙",
    name: "대전 꿈별이",
  },
  {
    region: "울산광역시",
    shortName: "울산",
    icon: "🐋",
    name: "울산 고래",
  },
  {
    region: "세종특별자치시",
    shortName: "세종",
    icon: "📚",
    name: "세종 책곰",
  },
  {
    region: "경기도",
    shortName: "경기",
    icon: "🐻",
    name: "경기 곰",
  },
  {
    region: "강원특별자치도",
    shortName: "강원",
    icon: "🐐",
    name: "강원 산양",
  },
  {
    region: "충청북도",
    shortName: "충북",
    icon: "🍎",
    name: "충북 사과곰",
  },
  {
    region: "충청남도",
    shortName: "충남",
    icon: "🦭",
    name: "충남 바다표범",
  },
  {
    region: "전북특별자치도",
    shortName: "전북",
    icon: "🐇",
    name: "전북 들토끼",
  },
  {
    region: "전라남도",
    shortName: "전남",
    icon: "🐙",
    name: "전남 문어",
  },
  {
    region: "경상북도",
    shortName: "경북",
    icon: "🦊",
    name: "경북 여우",
  },
  {
    region: "경상남도",
    shortName: "경남",
    icon: "🐢",
    name: "경남 거북이",
  },
  {
    region: "제주특별자치도",
    shortName: "제주",
    icon: "🗿",
    name: "제주 돌하르방",
  },
];
function setPlaceListMessage(message, type = "empty") {
  const placeList = document.querySelector(".place-list");

  if (!placeList) return;

  placeList.innerHTML = `<p class="${type}-text">${message}</p>`;
}

function setDefaultBackground(element, className) {
  element.style.backgroundImage = "";
  element.classList.add(className);
}

function setImageBackground(element, imageUrl, className) {
  element.classList.remove(className);
  element.style.backgroundImage = `url(${imageUrl})`;
}

function resizeImageFile(file, maxSize = 640, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      image.onerror = () => {
        resolve(reader.result);
      };

      image.src = reader.result;
    };

    reader.onerror = () => {
      reject(reader.error);
    };

    reader.readAsDataURL(file);
  });
}

function showScreen(id) {
  screens.forEach((screen) => {
    screen.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");

  document.querySelectorAll(".bottom-nav button[data-target]").forEach((button) => {
    button.classList.remove("nav-active");

    if (button.dataset.target === id) {
      button.classList.add("nav-active");
    }
  });

  if (id === "home") {
    renderHome();
  }
}


document.querySelectorAll(".bottom-nav button[data-target]").forEach((button) => {
  button.addEventListener("click", () => {
    showScreen(button.dataset.target);
  });
});

document.getElementById("openRecordForm").addEventListener("click", () => {
  showScreen("record");
});

document.getElementById("backToMy").addEventListener("click", () => {
  showScreen("my");
});

document.getElementById("openCalendar").addEventListener("click", () => {
  renderYearCalendar();
  showScreen("calendar");
});

document.getElementById("backToRecord").addEventListener("click", () => {
  showScreen("record");
});

function loadCurrentLocationAndPlaces() {
  if (!navigator.geolocation) {
    document.getElementById("locationInfo").textContent =
      "이 브라우저에서는 위치 기능을 지원하지 않습니다.";
    setPlaceListMessage("위치 기능을 사용할 수 없어 주변 관광지를 불러올 수 없습니다.");
    return;
  }

  document.getElementById("locationInfo").textContent =
    "현재 위치를 불러오는 중입니다.";
  setPlaceListMessage("현재 위치를 확인하는 중입니다.", "loading");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      document.getElementById("locationInfo").innerHTML =
        `
        위도: ${latitude.toFixed(6)}
        <br>
        경도: ${longitude.toFixed(6)}
        `;

      updateRegionName(latitude, longitude);
      fetchNearbyPlaces(latitude, longitude);

      console.log("위도:", latitude);
      console.log("경도:", longitude);
    },
    (error) => {
      console.error(error);
      const message =
        error.code === error.PERMISSION_DENIED
          ? "위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용한 뒤 다시 시도해주세요."
          : "위치 정보를 가져오지 못했습니다. 잠시 후 다시 시도해주세요.";

      document.getElementById("locationInfo").textContent = message;
      setPlaceListMessage(message);
    }
  );
}

document.getElementById("locationBtn").addEventListener("click", () => {
  loadCurrentLocationAndPlaces();
});

window.addEventListener("load", () => {
  loadCurrentLocationAndPlaces();
});

let selectedRecordImages = [];
let isRecordImageLoading = false;

function getRecordImages(record) {
  if (Array.isArray(record.images)) {
    return record.images.filter(Boolean);
  }

  return record.image ? [record.image] : [];
}

function getRecordCoverImage(record) {
  return getRecordImages(record)[0] || "";
}

function renderRecordImagePreview() {
  const preview = document.getElementById("imagePreview");
  preview.innerHTML = "";
  preview.style.backgroundImage = "";

  if (selectedRecordImages.length === 0) {
    preview.textContent = "미리보기";
    return;
  }

  selectedRecordImages.forEach((imageUrl) => {
    const image = document.createElement("div");
    image.className = "preview-thumb";
    image.style.backgroundImage = `url(${imageUrl})`;
    preview.appendChild(image);
  });
}

function resetRecordImageInput() {
  selectedRecordImages = [];
  document.getElementById("recordImageInput").value = "";
  renderRecordImagePreview();
}

document.getElementById("saveRecordBtn").addEventListener("click", () => {
  if (isRecordImageLoading) {
    alert("이미지를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  const title = document.getElementById("recordTitle").value.trim();
  const content = document.getElementById("recordContent").value.trim();

  if (!title) {
    alert("여행 제목을 입력해주세요.");
    return;
  }

  const record = {
    title,
    content,
    date: document.getElementById("selectedDateText").textContent,
    image: selectedRecordImages[0] || "",
    images: selectedRecordImages,
    region: document.getElementById("recordRegion").value,
  };

  const records = JSON.parse(localStorage.getItem("travelRecords")) || [];
  records.unshift(record);

  try {
    localStorage.setItem("travelRecords", JSON.stringify(records));
  } catch (error) {
    console.error(error);
    alert("이미지를 저장할 공간이 부족합니다. 이미지 수를 줄이거나 더 작은 이미지를 선택해주세요.");
    return;
  }

  alert("여행 기록이 저장되었습니다.");
  renderTravelRecords();
  updateMyStats();
  updateTravelMapCounts();
  updateMascotBook();
  renderTravelMapDashboard();

  document.getElementById("recordTitle").value = "";
  document.getElementById("recordContent").value = "";

  resetRecordImageInput();

  showScreen("my");
});

const currentYear = new Date().getFullYear();
const today = new Date();
const todayDateId = toDateId(today);
let selectedStartDate = null;
let selectedEndDate = null;

function toDateId(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateId) {
  return dateId ? dateId.replaceAll("-", ".") : "선택 전";
}

function updateCalendarText() {
  document.getElementById("startDateText").textContent =
    selectedStartDate ? formatDate(selectedStartDate) : "선택 전";

  document.getElementById("endDateText").textContent =
    selectedEndDate ? formatDate(selectedEndDate) : "선택 전";
}

function updateCalendarUI() {
  document.querySelectorAll(".calendar-grid button[data-date]").forEach((button) => {
    const dateId = button.dataset.date;

    button.classList.remove("picked", "range");

    if (dateId === selectedStartDate || dateId === selectedEndDate) {
      button.classList.add("picked");
    }

    if (
      selectedStartDate &&
      selectedEndDate &&
      dateId > selectedStartDate &&
      dateId < selectedEndDate
    ) {
      button.classList.add("range");
    }
  });

  updateCalendarText();
}

function selectCalendarDate(dateId) {
  if (dateId > todayDateId) return;

  if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
    selectedStartDate = dateId;
    selectedEndDate = null;
  } else if (dateId < selectedStartDate) {
    selectedEndDate = selectedStartDate;
    selectedStartDate = dateId;
  } else {
    selectedEndDate = dateId;
  }

  updateCalendarUI();
}

function renderYearCalendar() {
  const calendar = document.getElementById("yearCalendar");
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  calendar.innerHTML = "";

  for (let month = 0; month < 12; month += 1) {
    const monthEl = document.createElement("section");
    monthEl.className = "month-calendar";

    const title = document.createElement("h3");
    title.textContent = `${currentYear}년 ${month + 1}월`;
    monthEl.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "calendar-grid";

    weekDays.forEach((day) => {
      const label = document.createElement("span");
      label.textContent = day;
      grid.appendChild(label);
    });

    const firstDay = new Date(currentYear, month, 1).getDay();
    const lastDate = new Date(currentYear, month + 1, 0).getDate();

    for (let blank = 0; blank < firstDay; blank += 1) {
      const spacer = document.createElement("span");
      spacer.className = "calendar-blank";
      grid.appendChild(spacer);
    }

    for (let day = 1; day <= lastDate; day += 1) {
      const date = new Date(currentYear, month, day);
      const dateId = toDateId(date);
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.date = dateId;
      button.textContent = day;

      if (dateId === todayDateId) {
        button.classList.add("today");
      }

      if (dateId > todayDateId) {
        button.classList.add("future");
        button.disabled = true;
      } else {
        button.addEventListener("click", () => {
          selectCalendarDate(dateId);
        });
      }

      grid.appendChild(button);
    }

    monthEl.appendChild(grid);
    calendar.appendChild(monthEl);
  }

  updateCalendarUI();
}

function saveCalendarDate() {
  if (!selectedStartDate) {
    alert("시작일을 선택해주세요.");
    return;
  }

  if (!selectedEndDate) {
    selectedEndDate = selectedStartDate;
  }

  const dateText = `${formatDate(selectedStartDate)} ~ ${formatDate(selectedEndDate)}`;

  document.getElementById("selectedDateText").textContent = dateText;

  updateCalendarUI();
  showScreen("record");
}

document.getElementById("calendarDoneBtn").addEventListener("click", saveCalendarDate);
document.getElementById("calendarSaveBtn").addEventListener("click", saveCalendarDate);
function renderTravelRecords() {
  const recordList = document.getElementById("recordList");
  const records = JSON.parse(localStorage.getItem("travelRecords")) || [];

  recordList.innerHTML = "";

  if (records.length === 0) {
    recordList.innerHTML = `<p class="empty-text">아직 저장된 여행 기록이 없습니다.</p>`;
    return;
  }

  records.forEach((record, index) => {
    const item = document.createElement("div");
    item.className = "record-grid-item";

    const coverImage = getRecordCoverImage(record);
    if (coverImage) {
      item.style.backgroundImage = `url(${coverImage})`;
    } else {
      item.classList.add("default-detail-img");
    }

    item.innerHTML = `
      <button class="grid-delete-btn" data-index="${index}">삭제</button>
      <div class="record-grid-overlay">
        <strong>${record.title}</strong>
        <span>${record.date}</span>
      </div>
    `;
    item.addEventListener("click", () => {
    openRecordDetail(record);
    });
    recordList.appendChild(item);
  });

  document.querySelectorAll(".grid-delete-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();

      const index = Number(button.dataset.index);
      deleteTravelRecord(index);
    });
  });
}

renderTravelRecords();
updateMyStats();
function deleteTravelRecord(index) {
  const confirmed = confirm("이 여행 기록을 삭제하시겠습니까?");

  if (!confirmed) return;

  const records = JSON.parse(localStorage.getItem("travelRecords")) || [];

  records.splice(index, 1);

  localStorage.setItem("travelRecords", JSON.stringify(records));

  renderTravelRecords();

  alert("여행 기록이 삭제되었습니다.");
  updateMyStats();
  updateTravelMapCounts();
  updateMascotBook();
  renderTravelMapDashboard();
}
document.getElementById("recordImageInput").addEventListener("change", async (event) => {
  const files = Array.from(event.target.files || []);

  if (files.length === 0) {
    resetRecordImageInput();
    return;
  }

  isRecordImageLoading = true;

  try {
    selectedRecordImages = await Promise.all(
      files.map((file) => resizeImageFile(file, 640, 0.78))
    );

    renderRecordImagePreview();
  } catch (error) {
    console.error(error);
    alert("이미지를 불러오지 못했습니다. 다른 이미지를 선택해주세요.");
    resetRecordImageInput();
  } finally {
    isRecordImageLoading = false;
  }
});
async function fetchNearbyPlaces(latitude, longitude) {
  setPlaceListMessage("주변 관광지를 불러오는 중입니다.", "loading");

  const url =
    `https://apis.data.go.kr/B551011/KorService2/locationBasedList2` +
    `?serviceKey=${TOUR_API_KEY}` +
    `&MobileOS=ETC` +
    `&MobileApp=TripBuddy` +
    `&_type=json` +
    `&mapX=${longitude}` +
    `&mapY=${latitude}` +
    `&radius=3000` +
    `&arrange=E` +
    `&numOfRows=10` +
    `&pageNo=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log(data);

    const rawItems = data.response?.body?.items?.item || [];
    const items = Array.isArray(rawItems) ? rawItems : [rawItems];
    nearbyPlaces = items;
    renderNearbyPlaces(items);
    updateKakaoMap(latitude, longitude, items);
  } catch (error) {
    console.error(error);
    setPlaceListMessage("주변 관광지 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
  }
}

function renderNearbyPlaces(items) {
  const placeList = document.querySelector(".place-list");
  placeList.innerHTML = "";

  if (items.length === 0) {
    setPlaceListMessage("주변 관광지 정보가 없습니다.");
    return;
  }

  items.forEach((place) => {
    const distanceKm = place.dist
      ? (Number(place.dist) / 1000).toFixed(1)
      : "-";

    const imageUrl = place.firstimage || "";

    const card = document.createElement("article");
    card.className = "place-card";

    card.innerHTML = `
      ${
        imageUrl
          ? `<img class="place-api-img" src="${imageUrl}" alt="${place.title}">`
          : `<div class="place-img default-place-img">이미지 없음</div>`
      }
      <div>
        <h3>${place.title}</h3>
        <p>${place.addr1 || "주소 정보 없음"}</p>
        <span>📍 ${distanceKm}km</span>
      </div>
    `;

    card.addEventListener("click", () => {
      openPlaceDetail(place);
    });
    placeList.appendChild(card);
  });
}
function openPlaceDetail(place) {
  selectedPlace = place;
  const title = place.title || "관광지 이름";
  const address = place.addr1 || "주소 정보 없음";
  const distanceKm = place.dist
    ? (Number(place.dist) / 1000).toFixed(1)
    : "-";
  const imageUrl = place.firstimage || "";

  document.getElementById("detailTitle").textContent = title;
  document.getElementById("detailAddress").textContent = address;
  document.getElementById("detailDistance").textContent = `📍 ${distanceKm}km`;

  document.getElementById("detailDescription").textContent =
    `${title}은(는) 현재 위치 기준 주변 관광지 목록에서 조회된 장소입니다. 상세 소개 정보는 이후 관광공사 상세 API를 연결하여 확장할 수 있습니다.`;

  const detailImage = document.getElementById("detailImage");

  if (imageUrl) {
    setImageBackground(detailImage, imageUrl, "default-detail-img");
  } else {
    setDefaultBackground(detailImage, "default-detail-img");
  }
  fetchPlaceDetailIntro(place.contentid, place.contenttypeid);

  showScreen("placeDetail");
}

document.getElementById("backToNearby").addEventListener("click", () => {
  showScreen("nearby");
});

async function fetchPlaceDetailIntro(contentId, contentTypeId) {
  const fallbackText = document.getElementById("detailDescription").textContent;

  if (!contentId) {
    document.getElementById("detailDescription").textContent = fallbackText;
    return;
  }

  const url =
    `https://apis.data.go.kr/B551011/KorService2/detailCommon2` +
    `?serviceKey=${TOUR_API_KEY}` +
    `&MobileOS=ETC` +
    `&MobileApp=TripBuddy` +
    `&_type=json` +
    `&contentId=${contentId}` +
    `&defaultYN=Y` +
    `&overviewYN=Y` +
    `&addrinfoYN=Y` +
    `&mapinfoYN=Y` +
    `&firstImageYN=Y`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log("공통 상세 정보:", data);

    const item = data.response?.body?.items?.item?.[0];

    if (!item || !item.overview) {
      return;
    }

    document.getElementById("detailDescription").innerHTML =
      item.overview;
  } catch (error) {
    console.error(error);
  }
}
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {

    document.querySelectorAll(".tab").forEach((btn) => {
      btn.classList.remove("active");
    });

    tab.classList.add("active");

    const tabText = tab.textContent.trim();

    let sortedPlaces = [...nearbyPlaces];

    if (tabText === "거리순") {

      sortedPlaces.sort((a, b) => {
        return Number(a.dist || 999999) -
               Number(b.dist || 999999);
      });

    } else if (tabText === "인기순") {

      sortedPlaces.sort((a, b) => {
        return a.title.localeCompare(b.title);
      });

    }

    renderNearbyPlaces(sortedPlaces);
  });
});
document.getElementById("nearbyKeywordBtn").addEventListener("click", () => {
  const keyword = document.getElementById("nearbyKeywordInput").value.trim();

  if (!keyword) {
    alert("검색어를 입력해주세요.");
    return;
  }

  searchNearbyKeyword(keyword);
});

async function searchNearbyKeyword(keyword) {
  const url =
    `https://apis.data.go.kr/B551011/KorService2/searchKeyword2` +
    `?serviceKey=${TOUR_API_KEY}` +
    `&MobileOS=ETC` +
    `&MobileApp=TripBuddy` +
    `&_type=json` +
    `&keyword=${encodeURIComponent(keyword)}` +
    `&numOfRows=10` +
    `&pageNo=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log("키워드 검색 결과:", data);

    const rawItems = data.response?.body?.items?.item || [];
    const items = Array.isArray(rawItems) ? rawItems : [rawItems];

    nearbyPlaces = items;
    renderNearbyPlaces(items);
  } catch (error) {
    console.error(error);
    alert("검색 결과를 불러오지 못했습니다.");
  }
}
document.getElementById("nearbyKeywordInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    document.getElementById("nearbyKeywordBtn").click();
  }
});
document.getElementById("favoritePlaceBtn").addEventListener("click", () => {
  if (!selectedPlace) {
    alert("찜할 관광지를 선택해주세요.");
    return;
  }

  const favorites = JSON.parse(localStorage.getItem("favoritePlaces")) || [];

  const alreadySaved = favorites.some(
    (place) => place.contentid === selectedPlace.contentid
  );

  if (alreadySaved) {
    alert("이미 찜한 관광지입니다.");
    return;
  }

  favorites.unshift(selectedPlace);
  localStorage.setItem("favoritePlaces", JSON.stringify(favorites));

  renderFavoritePlaces();
  updateMyStats();

  alert("찜한 관광지에 저장되었습니다.");
});

function renderFavoritePlaces() {
  const favoriteList = document.getElementById("favoritePlaceList");
  const favorites = JSON.parse(localStorage.getItem("favoritePlaces")) || [];

  favoriteList.innerHTML = "";

  if (favorites.length === 0) {
    favoriteList.innerHTML = `<p class="empty-text">아직 찜한 관광지가 없습니다.</p>`;
    return;
  }

  favorites.forEach((place, index) => {
    const card = document.createElement("div");
    card.className = "record-card";

    card.innerHTML = `
      <div class="record-card-header">
        <h4>${place.title}</h4>
        <button class="delete-favorite-btn" data-index="${index}">삭제</button>
      </div>
      <p>${place.addr1 || "주소 정보 없음"}</p>
      <span>찜한 관광지</span>
    `;

    favoriteList.appendChild(card);
  });

  document.querySelectorAll(".delete-favorite-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      deleteFavoritePlace(index);
    });
  });
}

renderFavoritePlaces();
function deleteFavoritePlace(index) {
  const confirmed = confirm("이 찜한 관광지를 삭제하시겠습니까?");

  if (!confirmed) return;

  const favorites = JSON.parse(localStorage.getItem("favoritePlaces")) || [];

  favorites.splice(index, 1);

  localStorage.setItem("favoritePlaces", JSON.stringify(favorites));

  renderFavoritePlaces();
  updateMyStats();

  alert("찜한 관광지가 삭제되었습니다.");
}
document.getElementById("writeRecordFromPlaceBtn").addEventListener("click", () => {
  if (!selectedPlace) {
    alert("여행 기록을 작성할 관광지를 선택해주세요.");
    return;
  }

  document.getElementById("recordTitle").value = `${selectedPlace.title} 여행`;
  document.getElementById("recordContent").value =
    `${selectedPlace.title}에 다녀온 여행 기록을 남겨보세요.`;

  showScreen("record");
});
function openRecordDetail(record) {
  document.getElementById("recordDetailTitle").textContent = record.title || "여행 제목";
  document.getElementById("recordDetailDate").textContent = record.date || "여행 날짜";
  document.getElementById("recordDetailContent").textContent =
    record.content || "작성된 내용이 없습니다.";
  document.getElementById("recordDetailRegion").textContent =
    record.region || "지역 정보 없음";

  const images = getRecordImages(record);
  const detailImage = document.getElementById("recordDetailImage");
  const detailImages = document.getElementById("recordDetailImages");

  detailImages.innerHTML = "";

  if (images.length > 0) {
    setImageBackground(detailImage, images[0], "default-detail-img");

    images.forEach((imageUrl, index) => {
      const image = document.createElement("div");
      image.className = "record-detail-thumb";
      image.style.backgroundImage = `url(${imageUrl})`;

      if (index === 0) {
        image.classList.add("selected");
      }

      image.addEventListener("click", () => {
        setImageBackground(detailImage, imageUrl, "default-detail-img");

        detailImages.querySelectorAll(".record-detail-thumb").forEach((thumb) => {
          thumb.classList.remove("selected");
        });

        image.classList.add("selected");
      });

      detailImages.appendChild(image);
    });
  } else {
    setDefaultBackground(detailImage, "default-detail-img");
  }

  showScreen("recordDetail");
}

document.getElementById("backToMyFromRecordDetail").addEventListener("click", () => {
  showScreen("my");
});
let kakaoMap = null;
let kakaoMarkers = [];

function initKakaoMap(latitude = 37.242474, longitude = 127.038872) {
  const mapContainer = document.getElementById("kakaoMap");

  const mapOption = {
    center: new kakao.maps.LatLng(latitude, longitude),
    level: 5,
  };

  kakaoMap = new kakao.maps.Map(mapContainer, mapOption);

  const currentPosition = new kakao.maps.LatLng(latitude, longitude);

  new kakao.maps.Marker({
    position: currentPosition,
    map: kakaoMap,
  });
}

function updateKakaoMap(latitude, longitude, places = []) {
  if (!kakaoMap) {
    initKakaoMap(latitude, longitude);
  }

  const center = new kakao.maps.LatLng(latitude, longitude);
  kakaoMap.setCenter(center);

  kakaoMarkers.forEach((marker) => marker.setMap(null));
  kakaoMarkers = [];

  places.forEach((place) => {
    if (!place.mapy || !place.mapx) return;

    const markerPosition = new kakao.maps.LatLng(
      Number(place.mapy),
      Number(place.mapx)
    );

    const marker = new kakao.maps.Marker({
      position: markerPosition,
      map: kakaoMap,
    });

    kakaoMarkers.push(marker);

    kakao.maps.event.addListener(marker, "click", () => {
      openPlaceDetail(place);
    });
  });
}

initKakaoMap();
function updateMyStats() {
  const records =
    JSON.parse(localStorage.getItem("travelRecords")) || [];

  const favorites =
    JSON.parse(localStorage.getItem("favoritePlaces")) || [];

  document.getElementById("postCount").textContent =
    records.length;

  document.getElementById("placeCount").textContent =
    favorites.length;

  document.getElementById("mateCount").textContent =
    0;
}
document.getElementById("openTravelMapBtn").addEventListener("click", () => {
  renderTravelMapDashboard();
  showScreen("travelMap");
})

document.getElementById("backToMyFromTravelMap").addEventListener("click", () => {
  showScreen("my");
});

function updateRegionName(latitude, longitude) {
  const regionSelect = document.getElementById("regionSelect");

  if (!regionSelect) return;

  const geocoder = new kakao.maps.services.Geocoder();

  geocoder.coord2RegionCode(
    longitude,
    latitude,
    (result, status) => {
      if (status !== kakao.maps.services.Status.OK || result.length === 0) {
        console.log("지역명을 불러오지 못했습니다.");
        return;
      }

      const region = result.find((item) => item.region_type === "H") || result[0];

      const sido = region.region_1depth_name;

      console.log("현재 지역:", sido);

      const optionExists = Array.from(regionSelect.options).some((option) => {
        return option.value === sido;
      });

      if (!optionExists) {
        const option = document.createElement("option");
        option.value = sido;
        option.textContent = sido;
        regionSelect.appendChild(option);
      }

      regionSelect.value = sido;
      const recordRegion = document.getElementById("recordRegion");

      if (recordRegion) {
        const recordOptionExists = Array.from(recordRegion.options).some((option) => {
          return option.value === sido;
        });

        if (!recordOptionExists) {
          const option = document.createElement("option");
          option.value = sido;
          option.textContent = sido;
          recordRegion.appendChild(option);
        }

        recordRegion.value = sido;
      }
    }
  );
}
const SVG_REGION_BINDINGS = {
  서울특별시: [
    "#path132",
  ],

  부산광역시: [
    "#path94",
    "#path96",
    "#path98",
  ],

  대구광역시: [
    "#path672-0",
  ],

  인천광역시: [
    "#path338",
    "#path356",
    "#path352",
    "#path334",
    "#path336",
    "#path348",
    "#path340",
    "#path368",
  ],

  광주광역시: [
    "#path134",
  ],

  대전광역시: [
    "#path8",
  ],

  울산광역시: [
    "#path90",
  ],

  세종특별자치시: [
    "#path2",
  ],

  경기도: [
    '[fill="#F9D3B2"]',
  ],

  강원특별자치도: [
    "#path92",
  ],

  충청북도: [
    "#path10",
  ],

  충청남도: [
    '[fill="#F6C1A9"]',
  ],

  전북특별자치도: [
    '[fill="#F5C3C4"]',
  ],

  전라남도: [
    '[fill="#DABCD9"]',
  ],

  경상북도: [
    '[fill="#BFDFC0"]',
    "#path88-1",
  ],

  경상남도: [
    '[fill="#BCE1DF"]',
  ],

  제주특별자치도: [
    "#path136",
    "#path138",
  ],
};

function bindSvgRegionData(svg) {
  Object.entries(SVG_REGION_BINDINGS).forEach(
    ([regionName, selectors]) => {
      const matchedPaths = selectors.flatMap((selector) =>
        Array.from(svg.querySelectorAll(selector))
      );

      const uniquePaths = [...new Set(matchedPaths)];

      if (uniquePaths.length === 0) {
        console.warn(
          `SVG 경로를 찾지 못했습니다: ${regionName}`
        );
        return;
      }

      uniquePaths.forEach((path, index) => {
        path.dataset.region = regionName;
        path.setAttribute(
          "aria-label",
          regionName
        );

        if (index === 0) {
          path.setAttribute("tabindex", "0");
        }
      });
    }
  );
}

async function loadKoreaSvgMap() {
  const mapContainer = document.getElementById("koreaSvgMap");

  if (!mapContainer) return;

  try {
    const response = await fetch("assets/korea-map.svg");

    if (!response.ok) {
      throw new Error(`SVG load failed: ${response.status}`);
    }

    const svgText = await response.text();
    mapContainer.innerHTML = svgText;

    const svg = mapContainer.querySelector("svg");

    if (!svg) {
      throw new Error("불러온 파일에서 SVG 요소를 찾지 못했습니다.");
    }

    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "대한민국 지역별 방문 지도");

    bindSvgRegionData(svg);
    bindTravelMapRegionEvents();
    updateTravelMapCounts();
  } catch (error) {
    console.error(error);

    mapContainer.innerHTML = `
      <p class="empty-text">
        대한민국 지도를 불러오지 못했습니다.
      </p>
    `;
  }
}
function updateTravelMapCounts() {
  const records = getTravelRecords();
  const regionCounts = getRegionCounts(records);

  const regionPaths = document.querySelectorAll(
    "#koreaSvgMap path[data-region]"
  );

  regionPaths.forEach((regionPath) => {
    const regionName = normalizeRegionName(
      regionPath.dataset.region
    );

    const count = regionCounts[regionName] || 0;
    const level = getVisitLevel(count);

    regionPath.classList.remove(
      "lv-region-0",
      "lv-region-1",
      "lv-region-2",
      "lv-region-3"
    );

    regionPath.classList.add(
      `lv-region-${level}`
    );

    regionPath.dataset.visitCount = count;

    regionPath.setAttribute(
      "aria-label",
      `${regionName}, ${count}회 방문`
    );
  });
}
function getTravelRecords() {
  return JSON.parse(localStorage.getItem("travelRecords")) || [];
}
function getRecordStartDate(record) {
  if (!record?.date) return "";

  return record.date
    .split("~")[0]
    .trim()
    .replaceAll(".", "-");
}
function clearSelectedMapRegion() {
  document
    .querySelectorAll("#koreaSvgMap path.selected-region")
    .forEach((path) => {
      path.classList.remove("selected-region");
    });
}

function highlightSelectedMapRegion(regionName) {
  clearSelectedMapRegion();

  document
    .querySelectorAll("#koreaSvgMap path[data-region]")
    .forEach((path) => {
      const pathRegion = normalizeRegionName(path.dataset.region);

      if (pathRegion === regionName) {
        path.classList.add("selected-region");
      }
    });
}

function closeTravelRegionDetail() {
  const detailCard = document.getElementById("travelRegionDetail");

  if (detailCard) {
    detailCard.hidden = true;
  }

  clearSelectedMapRegion();
}
function renderTravelRegionDetail(regionName) {
  const normalizedRegion = normalizeRegionName(regionName);
  const records = getTravelRecords();

  const regionRecords = records.filter((record) => {
    return normalizeRegionName(record.region) === normalizedRegion;
  });

  regionRecords.sort((a, b) => {
    return getRecordStartDate(b).localeCompare(
      getRecordStartDate(a)
    );
  });

  const detailCard =
    document.getElementById("travelRegionDetail");

  const nameElement =
    document.getElementById("travelRegionDetailName");

  const countElement =
    document.getElementById("travelRegionDetailCount");

  const dateElement =
    document.getElementById("travelRegionDetailDate");

  const recordContainer =
    document.getElementById("travelRegionDetailRecords");

  if (
    !detailCard ||
    !nameElement ||
    !countElement ||
    !dateElement ||
    !recordContainer
  ) {
    return;
  }

  nameElement.textContent = normalizedRegion;

  countElement.textContent =
    `${regionRecords.length}회`;

  dateElement.textContent =
    regionRecords[0]?.date || "기록 없음";

  recordContainer.innerHTML = "";

  if (regionRecords.length === 0) {
    recordContainer.innerHTML = `
      <p class="empty-text">
        아직 이 지역에 저장된 여행 기록이 없습니다.
      </p>
    `;
  } else {
    regionRecords.forEach((record) => {
      const recordButton =
        document.createElement("button");

      recordButton.type = "button";
      recordButton.className =
        "travel-region-record-item";

      recordButton.innerHTML = `
        <strong>${record.title || "제목 없는 여행"}</strong>
        <span>${record.date || "날짜 정보 없음"}</span>
      `;

      recordButton.addEventListener("click", () => {
        openRecordDetail(record);
      });

      recordContainer.appendChild(recordButton);
    });
  }

  highlightSelectedMapRegion(normalizedRegion);
  detailCard.hidden = false;

  detailCard.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
}
function bindTravelMapRegionEvents() {
  const mapContainer =
    document.getElementById("koreaSvgMap");

  if (!mapContainer) return;

  mapContainer
    .querySelectorAll("path[data-region]")
    .forEach((path) => {
      path.addEventListener("click", () => {
        renderTravelRegionDetail(
          path.dataset.region
        );
      });

      path.addEventListener("keydown", (event) => {
        if (
          event.key !== "Enter" &&
          event.key !== " "
        ) {
          return;
        }

        event.preventDefault();

        renderTravelRegionDetail(
          path.dataset.region
        );
      });
    });
}

function renderTravelMapDashboard() {
  const records = getTravelRecords();

  updateTravelMapCounts();
  const visitedRegions = getVisitedRegions(records);
  const mostVisited = getMostVisitedRegion(records);
  const recentRegion = getRecentRegion(records);
  const topRegions = getTopRegions(records, 3);

  const totalCountElement = document.getElementById("travelMapTotalCount");
  const visitedCountElement = document.getElementById("travelMapVisitedCount");
  const regionCountElement = document.getElementById("travelMapRegionCount");
  const recentRegionElement = document.getElementById("travelMapRecentRegion");
  const recentDateElement = document.getElementById("travelMapRecentDate");
  const topRegionElement = document.getElementById("travelMapTopRegion");
  const topCountElement = document.getElementById("travelMapTopCount");

  if (totalCountElement) {
    totalCountElement.textContent = records.length;
  }

  if (visitedCountElement) {
    visitedCountElement.textContent = `${visitedRegions.length} / ${REGION_NAMES.length}`;
  }

  if (regionCountElement) {
    regionCountElement.textContent = visitedRegions.length;
  }

  if (recentRegionElement) {
    recentRegionElement.textContent = recentRegion.region || "없음";
  }

  if (recentDateElement) {
    recentDateElement.textContent = recentRegion.date || "기록 없음";
  }

  if (topRegionElement) {
    topRegionElement.textContent = mostVisited.region || "없음";
  }

  if (topCountElement) {
    topCountElement.textContent =
      mostVisited.count > 0 ? `${mostVisited.count}회 방문` : "0회 방문";
  }

  renderTravelMapTopThree(topRegions);
  renderTravelMapRegionList(visitedRegions);
}

function renderTravelMapTopThree(topRegions) {
  const container = document.getElementById("travelMapTopThree");

  if (!container) return;

  container.innerHTML = "";

  if (topRegions.length === 0) {
    container.innerHTML = `
      <p class="empty-text">아직 방문 기록이 없습니다.</p>
    `;
    return;
  }

  const medals = ["🥇", "🥈", "🥉"];

  topRegions.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "travel-top-card";

    card.innerHTML = `
      <span class="travel-top-medal">${medals[index]}</span>
      <strong>${item.region}</strong>
      <span>${item.count}회</span>
    `;

    container.appendChild(card);
  });
}

function renderTravelMapRegionList(visitedRegions) {
  const container = document.getElementById("travelMapRegionList");

  if (!container) return;

  container.innerHTML = "";

  if (visitedRegions.length === 0) {
    container.innerHTML = `
      <p class="empty-text">아직 방문 기록이 없습니다.</p>
    `;
    return;
  }

  const maxCount = visitedRegions[0].count;

  visitedRegions.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "travel-region-item";

    const percentage =
      maxCount > 0 ? Math.max((item.count / maxCount) * 100, 8) : 0;

    row.innerHTML = `
      <span class="travel-region-rank">${index + 1}</span>

      <div class="travel-region-info">
        <strong>${item.region}</strong>

        <div class="travel-region-bar">
          <span style="width: ${percentage}%"></span>
        </div>
      </div>

      <span class="travel-region-count">${item.count}회</span>
    `;

    container.appendChild(row);
  });
}
function updateMascotBook() {
  const grid = document.getElementById("mascotGrid");

  if (!grid) return;

  const records = getTravelRecords();

  const visitedRegions = new Set(
    records
      .map((record) =>
        normalizeRegionName(record.region)
      )
      .filter(Boolean)
  );

  grid.innerHTML = "";

  MASCOT_DATA.forEach((mascot) => {
    const normalizedRegion =
      normalizeRegionName(mascot.region);

    const isUnlocked =
      visitedRegions.has(normalizedRegion);

    const regionRecords = records.filter((record) => {
      return (
        normalizeRegionName(record.region) ===
        normalizedRegion
      );
    });

    const card = document.createElement("article");

    card.className = `mascot-card${
      isUnlocked ? " unlocked" : ""
    }`;

    card.dataset.region = normalizedRegion;

    card.innerHTML = `
      <div class="mascot-status">
        ${isUnlocked ? "수집 완료" : "미수집"}
      </div>

      <div class="mascot-icon">
        ${isUnlocked ? mascot.icon : "❔"}
      </div>

      <strong>${mascot.shortName}</strong>

      <span class="mascot-name">
        ${isUnlocked ? mascot.name : "아직 만나지 못했어요"}
      </span>

      <small>
        ${
          isUnlocked
            ? `${regionRecords.length}회 방문`
            : "여행 기록으로 해금"
        }
      </small>
    `;

    if (isUnlocked) {
      card.addEventListener("click", () => {
        showScreen("travelMap");

        setTimeout(() => {
          renderTravelRegionDetail(
            normalizedRegion
          );
        }, 100);
      });
    }

    grid.appendChild(card);
  });

  const unlockedCount = MASCOT_DATA.filter(
    (mascot) =>
      visitedRegions.has(
        normalizeRegionName(mascot.region)
      )
  ).length;

  const totalCount = MASCOT_DATA.length;

  const progressPercent =
    totalCount > 0
      ? Math.round(
          (unlockedCount / totalCount) * 100
        )
      : 0;

    const unlockedCountElement =
    document.getElementById("mascotUnlockedCount");

  const totalCountElement =
    document.getElementById("mascotTotalCount");

  const percentElement =
    document.getElementById("mascotProgressPercent");

  const progressFillElement =
    document.getElementById("mascotProgressFill");

  const messageElement =
    document.getElementById("mascotProgressMessage");

  if (unlockedCountElement) {
    unlockedCountElement.textContent = unlockedCount;
  }

  if (totalCountElement) {
    totalCountElement.textContent = totalCount;
  }

  if (percentElement) {
    percentElement.textContent = `${progressPercent}%`;
  }

  if (progressFillElement) {
    progressFillElement.style.width =
      `${progressPercent}%`;
  }

  if (messageElement) {
    if (unlockedCount === 0) {
      messageElement.textContent =
        "첫 여행 기록을 남기고 마스코트를 만나보세요.";
    } else if (unlockedCount === totalCount) {
      messageElement.textContent =
        "전국 마스코트 수집을 완료했어요!";
    } else {
      messageElement.textContent =
        `${totalCount - unlockedCount}개 지역이 남았어요.`;
    }
  }

  if (unlockedCount === 0) {
    messageElement.textContent =
      "첫 여행 기록을 남기고 마스코트를 만나보세요.";
  } else if (unlockedCount === totalCount) {
    messageElement.textContent =
      "전국 마스코트 수집을 완료했어요!";
  } else {
    messageElement.textContent =
      `${totalCount - unlockedCount}개 지역이 남았어요.`;
  }
}

document.getElementById("openMascotBookBtn").addEventListener("click", () => {
  updateMascotBook();
  showScreen("mascotBook");
});

document.getElementById("backToMyFromMascotBook").addEventListener("click", () => {
  showScreen("my");
});

let selectedProfileImage = "";
let isProfileImageLoading = false;

function loadProfile() {
  const profile = JSON.parse(localStorage.getItem("userProfile")) || {
    name: "닉네임을 설정해보세요",
    bio: "나만의 여행 프로필을 만들어보세요.",
    image: "",
  };

  document.getElementById("profileName").textContent = profile.name;
  document.getElementById("profileBio").textContent = profile.bio;

  const avatar = document.getElementById("profileAvatar");

  if (profile.image) {
    avatar.textContent = "";
    setImageBackground(avatar, profile.image, "default-avatar");
  } else {
    avatar.textContent = "🐶";
    setDefaultBackground(avatar, "default-avatar");
  }
}

document.getElementById("openProfileEditBtn").addEventListener("click", () => {
  const profile = JSON.parse(localStorage.getItem("userProfile")) || {
    name: "",
    bio: "",
    image: "",
  };

  selectedProfileImage = profile.image || "";

  document.getElementById("profileNameInput").value = profile.name;
  document.getElementById("profileBioInput").value = profile.bio;

  const preview = document.getElementById("profileImagePreview");

  if (selectedProfileImage) {
    preview.textContent = "";
    setImageBackground(preview, selectedProfileImage, "default-avatar");
  } else {
    preview.textContent = "🐶";
    setDefaultBackground(preview, "default-avatar");
  }

  showScreen("profileEdit");
});

document.getElementById("backToMyFromProfileEdit").addEventListener("click", () => {
  showScreen("my");
});

document.getElementById("profileImageInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];

  if (!file) return;

  isProfileImageLoading = true;

  try {
    selectedProfileImage = await resizeImageFile(file);

    const preview = document.getElementById("profileImagePreview");
    preview.textContent = "";
    setImageBackground(preview, selectedProfileImage, "default-avatar");
  } catch (error) {
    console.error(error);
    alert("프로필 이미지를 불러오지 못했습니다. 다른 이미지를 선택해주세요.");
  } finally {
    isProfileImageLoading = false;
  }
});

function saveProfile() {
  if (isProfileImageLoading) {
    alert("프로필 이미지를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  const name = document.getElementById("profileNameInput").value.trim();
  const bio = document.getElementById("profileBioInput").value.trim();

  if (!name) {
    alert("닉네임을 입력해주세요.");
    return;
  }

  const profile = {
    name,
    bio: bio || "소개글이 없습니다.",
    image: selectedProfileImage,
  };

  try {
    localStorage.setItem("userProfile", JSON.stringify(profile));
  } catch (error) {
    console.error(error);
    alert("프로필 이미지를 저장할 공간이 부족합니다. 더 작은 이미지를 선택해주세요.");
    return;
  }

  loadProfile();

  alert("프로필이 수정되었습니다.");

  showScreen("my");
}

document.getElementById("saveProfileBtn").addEventListener("click", saveProfile);

loadProfile();
function getHomeProfile() {
  return JSON.parse(localStorage.getItem("userProfile")) || {
    name: "닉네임을 설정해보세요",
    bio: "여행 프로필을 작성해보세요.",
    image: "",
  };
}

function getHomeVisitedRegionNames(records) {
  return [...new Set(
    records
      .map((record) => normalizeRegionName(record.region))
      .filter(Boolean)
  )];
}

function renderHome() {
  const profile = getHomeProfile();
  const records = JSON.parse(localStorage.getItem("travelRecords")) || [];
  const visitedRegions = getHomeVisitedRegionNames(records);
  
  document.getElementById("homeGreeting").textContent =
    records.length > 0
      ? "최근 여행 기록을 확인해보세요"
      : "나만의 여행을 기록해보세요";

  document.getElementById("homeProfileName").textContent = profile.name;
  document.getElementById("homeProfileBio").textContent = profile.bio;

  const homeAvatar = document.getElementById("homeAvatar");

  if (profile.image) {
    homeAvatar.textContent = "";
    setImageBackground(homeAvatar, profile.image, "default-avatar");
  } else {
    homeAvatar.textContent = "🐶";
    setDefaultBackground(homeAvatar, "default-avatar");
  }

  document.getElementById("homeRecordCount").textContent = records.length;
  document.getElementById("homeVisitedRegionCount").textContent = visitedRegions.length;
  const collectedMascotCount =
    MASCOT_DATA.filter((mascot) =>
      visitedRegions.includes(
        normalizeRegionName(mascot.region)
      )
    ).length;

  document.getElementById("homeMascotCount").textContent = collectedMascotCount;

  const list = document.getElementById("homeRecentRecords");
  list.innerHTML = "";

  if (records.length === 0) {
    list.innerHTML = `<p class="empty-text">아직 여행 기록이 없습니다.</p>`;
    return;
  }

  records.slice(0, 3).forEach((record) => {
    const coverImage = getRecordCoverImage(record);

    const card = document.createElement("article");
    card.className = "home-feed-card";

    card.innerHTML = `
      <div class="home-feed-top">
        <div class="home-mini-avatar">🌿</div>
        <div>
          <strong>${record.title || "제목 없음"}</strong>
          <p>${record.region || "지역 정보 없음"} · ${record.date || "날짜 정보 없음"}</p>
        </div>
      </div>

      <div class="home-feed-image ${coverImage ? "" : "default-place-img"}">
        ${coverImage ? "" : "이미지 없음"}
      </div>

      <p class="home-feed-content">
        ${record.content || "작성된 내용이 없습니다."}
      </p>
    `;

    const imageBox = card.querySelector(".home-feed-image");

    if (coverImage) {
      imageBox.style.backgroundImage = `url(${coverImage})`;
    }

    card.addEventListener("click", () => {
      openRecordDetail(record);
    });

    list.appendChild(card);
  });
}

document.getElementById("homeGoNearbyBtn").addEventListener("click", () => {
  showScreen("nearby");
});

document.getElementById("homeGoRecordBtn").addEventListener("click", () => {
  showScreen("record");
});

document.getElementById("homeGoMyBtn").addEventListener("click", () => {
  showScreen("my");
});

document.getElementById("homeGoMapBtn").addEventListener("click", () => {
  renderTravelMapDashboard();
  showScreen("travelMap");
});

document.getElementById("homeGoMascotBtn").addEventListener("click", () => {
  updateMascotBook();
  showScreen("mascotBook");
});


function initializeApp() {
  try {
    renderHome();
  } catch (error) {
    console.error("홈 화면 초기화 오류:", error);
  }

  try {
    loadKoreaSvgMap();
  } catch (error) {
    console.error("여행 지도 초기화 오류:", error);
  }

  try {
    updateMascotBook();
  } catch (error) {
    console.error("마스코트 도감 초기화 오류:", error);
  }
}

initializeApp();