function showTime() {
  const date = new Date();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  let session = "AM";

  if (hours === 0) {
    hours = 12;
  }

  if (hours > 12) {
    hours -= 12;
    session = "PM";
  }

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");
  const time = `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${session}`;

  const clockDisplay = document.getElementById("ClockDisplay");
  if (clockDisplay) {
    clockDisplay.innerText = time;
  }

  setTimeout(showTime, 1000);
}

showTime();