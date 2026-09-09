const hourFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: RIO_TZ,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});

function getRioHourDecimal(now) {
  const parts = hourFmt.formatToParts(now);
  const obj = {};
  parts.forEach(p => (obj[p.type] = p.value));
  let hour = parseInt(obj.hour, 10);
  if (hour === 24) hour = 0;
  return hour + parseInt(obj.minute, 10) / 60;
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]) {
  return "#" + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, "0")).join("");
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpColor(c1, c2, t) {
  const a = hexToRgb(c1);
  const b = hexToRgb(c2);
  return rgbToHex([lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]);
}

const SKY_KEYFRAMES = [
  { h: 0, top: "#0a0618", mid: "#140b28", low: "#1e1236", horizon: "#2a1842", bottom: "#331e4a", star: 1 },
  { h: 5, top: "#0d0920", mid: "#191032", low: "#2c1a40", horizon: "#4a2540", bottom: "#5c3048", star: 0.9 },
  { h: 6.5, top: "#1c1238", mid: "#4a2a5e", low: "#b8567a", horizon: "#ff9d6c", bottom: "#ffc98a", star: 0.15 },
  { h: 9, top: "#2f6fb0", mid: "#5590c8", low: "#8fc0e0", horizon: "#cfe6f2", bottom: "#eef8fc", star: 0 },
  { h: 12.5, top: "#1f74b8", mid: "#3f96d6", low: "#7fc4ea", horizon: "#bfe4f2", bottom: "#eaf6fb", star: 0 },
  { h: 16, top: "#356aa2", mid: "#6a94c4", low: "#e0ba7e", horizon: "#ffce8c", bottom: "#fff0d2", star: 0 },
  { h: 17.75, top: "#2a3768", mid: "#7a5088", low: "#e2734f", horizon: "#ff9d5c", bottom: "#ffd18a", star: 0.05 },
  { h: 18.5, top: "#180d30", mid: "#4a2a5e", low: "#a8456b", horizon: "#ff8a5c", bottom: "#ffb27c", star: 0.3 },
  { h: 19.5, top: "#100822", mid: "#2c1840", low: "#5c2f52", horizon: "#a8456b", bottom: "#c85f6a", star: 0.7 },
  { h: 21.5, top: "#0a0618", mid: "#150c2a", low: "#241442", horizon: "#3a1f45", bottom: "#4a2850", star: 0.95 },
  { h: 24, top: "#0a0618", mid: "#140b28", low: "#1e1236", horizon: "#2a1842", bottom: "#331e4a", star: 1 }
];

function getSkyState(hourDecimal) {
  let i = 0;
  while (i < SKY_KEYFRAMES.length - 2 && hourDecimal > SKY_KEYFRAMES[i + 1].h) i++;
  const a = SKY_KEYFRAMES[i];
  const b = SKY_KEYFRAMES[i + 1];
  const t = (hourDecimal - a.h) / (b.h - a.h);
  return {
    top: lerpColor(a.top, b.top, t),
    mid: lerpColor(a.mid, b.mid, t),
    low: lerpColor(a.low, b.low, t),
    horizon: lerpColor(a.horizon, b.horizon, t),
    bottom: lerpColor(a.bottom, b.bottom, t),
    star: lerp(a.star, b.star, t)
  };
}

const SUNRISE = 6.0;
const SUNSET = 18.5;
const SUN_EDGE_FADE = 0.4;
const SUN_TOP_NOON = 6;
const SUN_TOP_HORIZON = 34;
const SUN_LEFT_MIN = 12;
const SUN_LEFT_MAX = 82;

function getSunState(hourDecimal) {
  if (hourDecimal < SUNRISE - SUN_EDGE_FADE || hourDecimal > SUNSET + SUN_EDGE_FADE) {
    return { visible: false };
  }
  const clamped = Math.min(Math.max(hourDecimal, SUNRISE), SUNSET);
  const fraction = (clamped - SUNRISE) / (SUNSET - SUNRISE);
  const arc = Math.sin(fraction * Math.PI);
  const distFromNoon = Math.abs(fraction - 0.5) * 2;

  let fade = 1;
  if (hourDecimal < SUNRISE) fade = 1 - (SUNRISE - hourDecimal) / SUN_EDGE_FADE;
  if (hourDecimal > SUNSET) fade = 1 - (hourDecimal - SUNSET) / SUN_EDGE_FADE;
  fade = Math.max(0, Math.min(1, fade));

  return {
    visible: true,
    top: SUN_TOP_HORIZON - (SUN_TOP_HORIZON - SUN_TOP_NOON) * arc,
    left: SUN_LEFT_MIN + (SUN_LEFT_MAX - SUN_LEFT_MIN) * fraction,
    core: lerpColor("#fff6d8", "#ffb35c", distFromNoon),
    glow: lerpColor("#ffe9a8", "#ff7a3c", distFromNoon),
    scale: 1 + 0.22 * distFromNoon,
    opacity: (0.5 + 0.4 * distFromNoon) * fade
  };
}

const skyRoot = document.documentElement;
const starsEl = document.getElementById("stars");
const sunEl = document.getElementById("sun");

function updateSky() {
  const hourDecimal = getRioHourDecimal(new Date());
  const sky = getSkyState(hourDecimal);
  skyRoot.style.setProperty("--sky-top", sky.top);
  skyRoot.style.setProperty("--sky-mid", sky.mid);
  skyRoot.style.setProperty("--sky-low", sky.low);
  skyRoot.style.setProperty("--sky-horizon", sky.horizon);
  skyRoot.style.setProperty("--sky-bottom", sky.bottom);
  starsEl.style.opacity = sky.star;

  const sun = getSunState(hourDecimal);
  if (!sun.visible) {
    sunEl.style.opacity = 0;
    return;
  }
  sunEl.style.top = sun.top + "%";
  sunEl.style.left = sun.left + "%";
  sunEl.style.opacity = sun.opacity;
  sunEl.style.transform = `translate(-50%, -50%) scale(${sun.scale})`;
  sunEl.style.background = `radial-gradient(circle, ${sun.core} 0%, ${sun.glow} 55%, transparent 72%)`;
  const [r, g, b] = hexToRgb(sun.glow);
  sunEl.style.boxShadow = `0 0 70px 18px rgba(${r}, ${g}, ${b}, 0.35)`;
}

updateSky();
setInterval(updateSky, 60 * 1000);
