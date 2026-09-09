const TARGET_HOUR = 18;
const TARGET_MINUTE = 30;
const RIO_TZ = "America/Sao_Paulo";
const RIO_OFFSET = "-03:00";

const hhEl = document.getElementById("hh");
const mmEl = document.getElementById("mm");
const ssEl = document.getElementById("ss");
const nowClockEl = document.getElementById("now-clock");

const dateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: RIO_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

const clockFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: RIO_TZ,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});

function pad(n) {
  return String(n).padStart(2, "0");
}

function getTargetDate(now) {
  const ymd = dateFmt.format(now);
  let target = new Date(`${ymd}T${pad(TARGET_HOUR)}:${pad(TARGET_MINUTE)}:00${RIO_OFFSET}`);
  if (target.getTime() <= now.getTime()) {
    target = new Date(target.getTime() + 24 * 60 * 60 * 1000);
  }
  return target;
}

function tick() {
  const now = new Date();
  const target = getTargetDate(now);
  const diff = Math.max(0, target.getTime() - now.getTime());

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  hhEl.textContent = pad(hours);
  mmEl.textContent = pad(minutes);
  ssEl.textContent = pad(seconds);

  nowClockEl.textContent = clockFmt.format(now);
}

tick();
setInterval(tick, 1000);
