/* ===== START PAGE =====
   Opened from the START button in the footer (#start).
   Shows the Paintbrush picture with a mysterious countdown ticking
   down in real time — days, hours, minutes, seconds and hundredths.

   It doesn't mean anything yet. To change when it reaches zero,
   edit the date in TARGET_DATE below (ISO format: "YYYY-MM-DDTHH:mm:ssZ").
*/

const START_HASH = "#start";
const TARGET_DATE = new Date("2027-11-23T00:00:00Z").getTime();

const countdownEl = document.getElementById("start-countdown");
const footerButton = document.getElementById("footer-start");

let frameId = null;

function pad(value, length) {
  return String(value).padStart(length, "0");
}

function formatRemaining(ms) {
  if (ms < 0) {
    ms = 0;
  }
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const hundredths = Math.floor((ms % 1000) / 10);
  return days + "D " + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "." + pad(hundredths, 2);
}

function tick() {
  countdownEl.textContent = formatRemaining(TARGET_DATE - Date.now());
  frameId = requestAnimationFrame(tick);
}

function startTicking() {
  if (frameId === null) {
    tick();
  }
}

function stopTicking() {
  cancelAnimationFrame(frameId);
  frameId = null;
}

function syncWithRoute() {
  const open = window.location.hash === START_HASH;
  footerButton.classList.toggle("is-active", open);
  if (open) {
    startTicking();
  } else {
    stopTicking();
  }
}

window.addEventListener("hashchange", syncWithRoute);
syncWithRoute();
