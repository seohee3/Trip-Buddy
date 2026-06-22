const screens = document.querySelectorAll(".screen");

function showScreen(id) {
  screens.forEach((screen) => {
    screen.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");
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
  alert("GPS 현재 위치 기능은 다음 단계에서 연결할 예정입니다.");
});