const DEFAULT_TARGET = { hour: 18, minute: 30 };
const FRIDAY_TARGET = { hour: 17, minute: 30 };
const RIO_TZ = "America/Sao_Paulo";
const RIO_OFFSET = "-03:00";

const sceneEl = document.getElementById("scene");
const hhEl = document.getElementById("hh");
const mmEl = document.getElementById("mm");
const ssEl = document.getElementById("ss");
const nowClockEl = document.getElementById("now-clock");
const targetLabelEl = document.getElementById("target-label");
const headlineTextEl = document.getElementById("headline-text");

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

function targetForYmd(ymd) {
  const weekday = new Date(`${ymd}T12:00:00Z`).getUTCDay();
  return weekday === 5 ? FRIDAY_TARGET : DEFAULT_TARGET;
}

function tick() {
  const now = new Date();
  const ymd = dateFmt.format(now);
  const { hour, minute } = targetForYmd(ymd);
  const target = new Date(`${ymd}T${pad(hour)}:${pad(minute)}:00${RIO_OFFSET}`);

  const isOvertime = now.getTime() >= target.getTime();
  const diffMs = isOvertime ? now.getTime() - target.getTime() : target.getTime() - now.getTime();

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  hhEl.textContent = pad(hours);
  mmEl.textContent = pad(minutes);
  ssEl.textContent = pad(seconds);

  nowClockEl.textContent = clockFmt.format(now);
  targetLabelEl.textContent = `${pad(hour)}:${pad(minute)}`;
  headlineTextEl.textContent = isOvertime ? "Hora extra desde as" : "Contagem regressiva até as";
  sceneEl.classList.toggle("is-overtime", isOvertime);
}

tick();
setInterval(tick, 1000);
