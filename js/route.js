const ROUTE_ORIGIN = { lon: -43.3667153, lat: -22.9694429, label: "Av. Ator José Wilker — Barra Olímpica" };
const ROUTE_DEST = { lon: -43.3493075, lat: -22.9364727, label: "Tv. Cunha Galvão, 136 — Jacarepaguá" };

async function loadRoute() {
  const routeEl = document.getElementById("route");
  try {
    const coords = `${ROUTE_ORIGIN.lon},${ROUTE_ORIGIN.lat};${ROUTE_DEST.lon},${ROUTE_DEST.lat}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=false`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Falha na resposta da rota");
    const data = await res.json();
    const route = data.routes && data.routes[0];
    if (!route) throw new Error("Sem rota disponível");

    const km = (route.distance / 1000).toFixed(1).replace(".", ",");
    const min = Math.round(route.duration / 60);

    routeEl.innerHTML = `
      <p class="route-eyebrow">Trânsito agora</p>
      <div class="route-path">
        <div class="route-stop"><span class="route-dot origin"></span><span>${ROUTE_ORIGIN.label}</span></div>
        <div class="route-line"></div>
        <div class="route-stop"><span class="route-dot dest"></span><span>${ROUTE_DEST.label}</span></div>
      </div>
      <div class="route-figures">
        <div><span class="route-value">${min}</span><span class="route-label">min</span></div>
        <div><span class="route-value">${km}</span><span class="route-label">km</span></div>
      </div>
      <p class="route-note">Estimativa de rota (OSRM), sem trânsito ao vivo</p>`;
  } catch (err) {
    routeEl.innerHTML = '<p class="route-status">Não foi possível calcular a rota agora.</p>';
  }
}

loadRoute();
