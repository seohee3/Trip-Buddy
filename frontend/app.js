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