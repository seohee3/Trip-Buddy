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
  };

  const records = JSON.parse(localStorage.getItem("travelRecords")) || [];
  records.unshift(record);
  localStorage.setItem("travelRecords", JSON.stringify(records));

  alert("여행 기록이 저장되었습니다.");

  document.getElementById("recordTitle").value = "";
  document.getElementById("recordContent").value = "";

  showScreen("my");
});
document.getElementById("calendarDoneBtn").addEventListener("click", () => {
  showScreen("record");
});

document.getElementById("calendarSaveBtn").addEventListener("click", () => {
  showScreen("record");
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