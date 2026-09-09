const ICONS = {
  sun: '<circle cx="12" cy="12" r="4"></circle><line x1="12" y1="2" x2="12" y2="5"></line><line x1="12" y1="19" x2="12" y2="22"></line><line x1="2" y1="12" x2="5" y2="12"></line><line x1="19" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="4.93" x2="7.05" y2="7.05"></line><line x1="16.95" y1="16.95" x2="19.07" y2="19.07"></line><line x1="4.93" y1="19.07" x2="7.05" y2="16.95"></line><line x1="16.95" y1="7.05" x2="19.07" y2="4.93"></line>',
  partly: '<circle cx="8" cy="8" r="2.6"></circle><line x1="8" y1="2" x2="8" y2="3.6"></line><line x1="2.6" y1="8" x2="4.2" y2="8"></line><line x1="3.6" y1="3.6" x2="4.7" y2="4.7"></line><path d="M18.5 20H8a4.2 4.2 0 0 1-.6-8.36A6 6 0 0 1 19 10.2 3.8 3.8 0 0 1 18.5 20Z"></path>',
  cloud: '<path d="M18.5 19H7.5a4.5 4.5 0 0 1-.7-8.94A6.2 6.2 0 0 1 19 9.7 3.8 3.8 0 0 1 18.5 19Z"></path>',
  rain: '<path d="M17.5 16H7a4.2 4.2 0 0 1-.6-8.36A6 6 0 0 1 18 6.7 3.8 3.8 0 0 1 17.5 16Z"></path><line x1="8" y1="19" x2="7" y2="22"></line><line x1="12.5" y1="19" x2="11.5" y2="22"></line><line x1="17" y1="19" x2="16" y2="22"></line>',
  storm: '<path d="M17.5 15H7a4.2 4.2 0 0 1-.6-8.36A6 6 0 0 1 18 5.7 3.8 3.8 0 0 1 17.5 15Z"></path><polyline points="13 14 10 19 12.5 19 11 23"></polyline>'
};

function weatherInfo(code) {
  if (code === 0) return { icon: "sun", label: "Céu limpo" };
  if (code === 1 || code === 2) return { icon: "partly", label: "Parcialmente nublado" };
  if (code === 3) return { icon: "cloud", label: "Nublado" };
  if (code === 45 || code === 48) return { icon: "cloud", label: "Neblina" };
  if ([51, 53, 55, 56, 57].includes(code)) return { icon: "rain", label: "Garoa" };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { icon: "rain", label: "Chuva" };
  if ([95, 96, 99].includes(code)) return { icon: "storm", label: "Tempestade" };
  return { icon: "cloud", label: "Sem dados" };
}

function iconSvg(name) {
  return `<svg viewBox="0 0 24 24">${ICONS[name] || ICONS.cloud}</svg>`;
}

function weatherCard(dayLabel, code, max, min) {
  const info = weatherInfo(code);
  return `
    <div class="weather-card">
      <p class="weather-day">${dayLabel}</p>
      <div class="weather-icon">${iconSvg(info.icon)}</div>
      <p class="weather-desc">${info.label}</p>
      <p class="weather-temps">${Math.round(max)}&deg;<span class="temp-sep">/</span>${Math.round(min)}&deg;</p>
    </div>`;
}

async function loadWeather() {
  const weatherEl = document.getElementById("weather");
  const nowTempEl = document.getElementById("now-temp");
  try {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=-22.9068&longitude=-43.1729"
      + "&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min"
      + "&timezone=America%2FSao_Paulo&forecast_days=2";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Falha na resposta da previsão");
    const data = await res.json();

    const currentInfo = weatherInfo(data.current.weather_code);
    nowTempEl.textContent = `· ${Math.round(data.current.temperature_2m)}°C, ${currentInfo.label.toLowerCase()}`;

    weatherEl.innerHTML =
      weatherCard("Hoje", data.daily.weather_code[0], data.daily.temperature_2m_max[0], data.daily.temperature_2m_min[0])
      + '<div class="weather-divider"></div>'
      + weatherCard("Amanhã", data.daily.weather_code[1], data.daily.temperature_2m_max[1], data.daily.temperature_2m_min[1]);
  } catch (err) {
    weatherEl.innerHTML = '<p class="weather-status">Não foi possível carregar a previsão agora.</p>';
  }
}

loadWeather();
setInterval(loadWeather, 15 * 60 * 1000);
