const TOUR_API_KEY = "a2652d41b57533048e6566c0afca1ba6f190d1706286e228c74f843544f8d3a8";
const screens = document.querySelectorAll(".screen");

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

    placeList.appendChild(card);
  });
}