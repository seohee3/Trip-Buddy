const TOUR_API_KEY = "a2652d41b57533048e6566c0afca1ba6f190d1706286e228c74f843544f8d3a8";
const screens = document.querySelectorAll(".screen");
let nearbyPlaces = [];

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
  showScreen("calendar");
});

document.getElementById("backToRecord").addEventListener("click", () => {
  showScreen("record");
});

document.getElementById("locationBtn").addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("이 브라우저에서는 위치 기능을 지원하지 않습니다.");
    return;
  }

  alert("현재 위치를 가져오는 중입니다.");

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
      fetchNearbyPlaces(latitude, longitude);

      console.log("위도:", latitude);
      console.log("경도:", longitude);
    },
    (error) => {
      console.error(error);
      alert("위치 정보를 가져오지 못했습니다. 브라우저 위치 권한을 허용해주세요.");
    }
  );
});
document.getElementById("saveRecordBtn").addEventListener("click", () => {
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
    image: selectedImageData,
};

  const records = JSON.parse(localStorage.getItem("travelRecords")) || [];
  records.unshift(record);
  localStorage.setItem("travelRecords", JSON.stringify(records));

  alert("여행 기록이 저장되었습니다.");
  renderTravelRecords();

  document.getElementById("recordTitle").value = "";
  document.getElementById("recordContent").value = "";

  selectedImageData = "";
  document.getElementById("recordImageInput").value = "";
  document.getElementById("imagePreview").textContent = "미리보기";
  document.getElementById("imagePreview").style.backgroundImage = "";

  showScreen("my");
});

let selectedStartDay = null;
let selectedEndDay = null;

function formatDate(day) {
  return `2026.05.${String(day).padStart(2, "0")}`;
}

function updateCalendarText() {
  document.getElementById("startDateText").textContent =
    selectedStartDay ? formatDate(selectedStartDay) : "선택 전";

  document.getElementById("endDateText").textContent =
    selectedEndDay ? formatDate(selectedEndDay) : "선택 전";
}

function updateCalendarUI() {
  document.querySelectorAll(".calendar-grid button[data-day]").forEach((button) => {
    const day = Number(button.dataset.day);

    button.classList.remove("picked", "range");

    if (day === selectedStartDay || day === selectedEndDay) {
      button.classList.add("picked");
    }

    if (
      selectedStartDay &&
      selectedEndDay &&
      day > selectedStartDay &&
      day < selectedEndDay
    ) {
      button.classList.add("range");
    }
  });

  updateCalendarText();
}

document.querySelectorAll(".calendar-grid button[data-day]").forEach((button) => {
  button.addEventListener("click", () => {
    const day = Number(button.dataset.day);

    if (!selectedStartDay || (selectedStartDay && selectedEndDay)) {
      selectedStartDay = day;
      selectedEndDay = null;
    } else if (day < selectedStartDay) {
      selectedEndDay = selectedStartDay;
      selectedStartDay = day;
    } else {
      selectedEndDay = day;
    }

    updateCalendarUI();
  });
});

function saveCalendarDate() {
  if (!selectedStartDay) {
    alert("시작일을 선택해주세요.");
    return;
  }

  if (!selectedEndDay) {
    selectedEndDay = selectedStartDay;
  }

  const dateText = `${formatDate(selectedStartDay)} ~ ${formatDate(selectedEndDay)}`;

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
    const card = document.createElement("div");
    card.className = "record-card";

    card.innerHTML = `
    ${record.image ? `<div class="record-image" style="background-image: url(${record.image})"></div>` : ""}
    <div class="record-card-header">
        <h4>${record.title}</h4>
        <button class="delete-record-btn" data-index="${index}">삭제</button>
    </div>
    <p>${record.content || "작성된 내용이 없습니다."}</p>
    <span>${record.date}</span>
`;

    recordList.appendChild(card);
});

document.querySelectorAll(".delete-record-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const index = Number(button.dataset.index);
    deleteTravelRecord(index);
  });
});
}

renderTravelRecords();
function deleteTravelRecord(index) {
  const confirmed = confirm("이 여행 기록을 삭제하시겠습니까?");

  if (!confirmed) return;

  const records = JSON.parse(localStorage.getItem("travelRecords")) || [];

  records.splice(index, 1);

  localStorage.setItem("travelRecords", JSON.stringify(records));

  renderTravelRecords();

  alert("여행 기록이 삭제되었습니다.");
}
let selectedImageData = "";

document.getElementById("recordImageInput").addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    selectedImageData = reader.result;

    const preview = document.getElementById("imagePreview");
    preview.textContent = "";
    preview.style.backgroundImage = `url(${selectedImageData})`;
  };

  reader.readAsDataURL(file);
});
async function fetchNearbyPlaces(latitude, longitude) {
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
  } catch (error) {
    console.error(error);
    alert("주변 관광지 정보를 불러오지 못했습니다.");
  }
}

function renderNearbyPlaces(items) {
  const placeList = document.querySelector(".place-list");
  placeList.innerHTML = "";

  if (items.length === 0) {
    placeList.innerHTML = `<p>주변 관광지 정보가 없습니다.</p>`;
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
          : `<div class="place-img img1"></div>`
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
    detailImage.style.backgroundImage = `url(${imageUrl})`;
  } else {
    detailImage.style.backgroundImage = "";
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