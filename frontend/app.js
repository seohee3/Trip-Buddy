const TOUR_API_KEY = "a2652d41b57533048e6566c0afca1ba6f190d1706286e228c74f843544f8d3a8";
const screens = document.querySelectorAll(".screen");
let nearbyPlaces = [];
let selectedPlace = null;

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
  updateTravelMapCounts();
  showScreen("travelMap");
});

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
function updateTravelMapCounts() {
  const records = JSON.parse(localStorage.getItem("travelRecords")) || [];

  const regionCounts = {};

  records.forEach((record) => {
    if (!record.region) return;

    regionCounts[record.region] = (regionCounts[record.region] || 0) + 1;
  });

  document.querySelectorAll(".region[data-region]").forEach((regionEl) => {
    const regionName = regionEl.dataset.region;
    const count = regionCounts[regionName] || 0;

    regionEl.classList.remove(
      "lv-region-0",
      "lv-region-1",
      "lv-region-2",
      "lv-region-3"
    );

    if (count === 0) {
      regionEl.classList.add("lv-region-0");
    } else if (count === 1) {
      regionEl.classList.add("lv-region-1");
    } else if (count <= 3) {
      regionEl.classList.add("lv-region-2");
    } else {
      regionEl.classList.add("lv-region-3");
    }

    const countText = regionEl.querySelector("span");
    countText.textContent = `${count}회`;
  });
}
function updateMascotBook() {
  const records = JSON.parse(localStorage.getItem("travelRecords")) || [];
  const visitedRegions = records.map((record) => record.region);

  document.querySelectorAll(".mascot-card").forEach((card) => {
    const region = card.dataset.region;

    if (visitedRegions.includes(region)) {
      card.classList.add("unlocked");
    } else {
      card.classList.remove("unlocked");
    }
  });
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

function getVisitedRegions(records) {
  return [...new Set(records.map((record) => record.region).filter(Boolean))];
}

function renderHome() {
  const profile = getHomeProfile();
  const records = JSON.parse(localStorage.getItem("travelRecords")) || [];
  const visitedRegions = getVisitedRegions(records);

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
  document.getElementById("homeMascotCount").textContent = visitedRegions.length;

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
  updateTravelMapCounts();
  showScreen("travelMap");
});

document.getElementById("homeGoMascotBtn").addEventListener("click", () => {
  updateMascotBook();
  showScreen("mascotBook");
});

renderHome();