async function loadJSON(url) {
  const r = await fetch(url);
  return await r.json();
}

let map, stops = [], routes = [], stopsMap = new Map();

// 🗺️ Mostrar rota com traçado real
function drawRoute(route) {
  if (!map) return;
  map.eachLayer(l => { if (l._temp) map.removeLayer(l); });
  let latlngs = [];

  if (route.geometry_real && route.geometry_real.length > 1) {
    latlngs = route.geometry_real.map(p => [p[0], p[1]]);
  } else if (route.geometry && route.geometry.length > 1) {
    latlngs = route.geometry.map(p => [p[0], p[1]]);
  } else {
    latlngs = route.stops.map(id => {
      const s = stopsMap.get(id);
      return s ? [s.lat, s.lon] : null;
    }).filter(Boolean);
  }

  const colors = ['#0077ff', '#ff006e', '#00b4d8', '#ffb703', '#06d6a0', '#8b5cf6', '#fb5607'];
  const color = colors[Math.abs(hashCode(route.route_id)) % colors.length];
  const poly = L.polyline(latlngs, { color: color, weight: 5, opacity: 0.9, smoothFactor: 1.2 });
  poly._temp = true;
  poly.addTo(map);
  map.fitBounds(poly.getBounds(), { padding: [30, 30] });

  for (const id of route.stops) {
    const s = stopsMap.get(id);
    if (s) {
      const marker = L.circleMarker([s.lat, s.lon], {
        radius: 5, color: color, fillColor: color, fillOpacity: 0.9
      }).bindPopup(s.name);
      marker._temp = true;
      marker.addTo(map);
    }
  }
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return hash;
}

function markStop(stop) {
  if (!map) return;
  map.eachLayer(l => { if (l._temp) map.removeLayer(l); });
  const m = L.marker([stop.lat, stop.lon]);
  m._temp = true;
  m.addTo(map).bindPopup(stop.name).openPopup();
  map.setView([stop.lat, stop.lon], 16);
}

function showAllStops() {
  const group = [];
  for (const s of stops) {
    const m = L.circleMarker([s.lat, s.lon], {
      radius: 5, color: "#f59e0b", fillColor: "#fbbf24", fillOpacity: 0.9
    }).bindPopup(s.name);
    m.addTo(map);
    group.push(m);
  }
  const g = L.featureGroup(group);
  map.fitBounds(g.getBounds(), { padding: [20, 20] });
}

window.onload = async () => {
  let data;
  try {
    data = await loadJSON("data/vr_bus_routing.json");
  } catch {
    data = await loadJSON("data/vr_bus.json");
  }

  stops = data.stops; routes = data.routes;
  stops.forEach(s => stopsMap.set(s.id, s));

  map = L.map("map").setView([41.3, -7.74], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, attribution: "© OpenStreetMap"
  }).addTo(map);

  showAllStops();

  const stopsList = document.getElementById("stops-list");
  for (const s of stops) {
    const li = document.createElement("li");
    li.textContent = `${s.name} (${s.lat.toFixed(4)}, ${s.lon.toFixed(4)})`;
    li.onclick = () => markStop(s);
    stopsList.appendChild(li);
  }

  const routesList = document.getElementById("routes-list");
  for (const r of routes) {
    const li = document.createElement("li");
    li.textContent = `${r.name} (${r.stops.length} paragens)`;
    li.onclick = () => drawRoute(r);
    routesList.appendChild(li);
  }

  const legendList = document.getElementById("legend-list");
  const colors = ['#0077ff', '#ff006e', '#00b4d8', '#ffb703', '#06d6a0', '#8b5cf6', '#fb5607'];
  for (const r of routes) {
    const color = colors[Math.abs(hashCode(r.route_id)) % colors.length];
    const li = document.createElement("li");
    const colorDot = document.createElement("div");
    colorDot.className = "legend-color";
    colorDot.style.background = color;
    const text = document.createElement("span");
    text.textContent = r.name;
    li.appendChild(colorDot); li.appendChild(text);
    legendList.appendChild(li);
  }

  // --- 🧭 Planeador de Rota ---
  const destinationInput = document.getElementById("destination");
  const startAddressContainer = document.getElementById("start-address-container");
  const startOptions = document.getElementsByName("startOption");
  const startInput = document.getElementById("start");
  const calcBtn = document.getElementById("calculate-route");

  startOptions.forEach(opt => {
    opt.addEventListener("change", () => {
      startAddressContainer.style.display = (opt.value === "address" && opt.checked) ? "block" : "none";
    });
  });

  async function geocode(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.length > 0 ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) } : null;
  }

  function nearestStop(lat, lon) {
    let nearest = null, minDist = Infinity;
    for (const s of stops) {
      const d = Math.sqrt((s.lat - lat) ** 2 + (s.lon - lon) ** 2);
      if (d < minDist) { minDist = d; nearest = s; }
    }
    return nearest;
  }

  calcBtn.onclick = async () => {
    let startCoords;
    const startOption = document.querySelector('input[name="startOption"]:checked').value;

    if (startOption === "current") {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          p => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
          err => reject(err)
        );
      });
      startCoords = pos;
    } else {
      const startAddr = startInput.value.trim();
      if (!startAddr) return alert("Introduza a morada de partida.");
      const geo = await geocode(startAddr);
      if (!geo) return alert("Morada de partida não encontrada.");
      startCoords = geo;
    }

    const destAddr = destinationInput.value.trim();
    if (!destAddr) return alert("Introduza a morada de destino.");
    const destCoords = await geocode(destAddr);
    if (!destCoords) return alert("Morada de destino não encontrada.");

    const startStop = nearestStop(startCoords.lat, startCoords.lon);
    const destStop = nearestStop(destCoords.lat, destCoords.lon);
    if (!startStop || !destStop) return alert("Não foi possível encontrar paragens próximas.");

    map.eachLayer(l => { if (l._temp) map.removeLayer(l); });

    const startMarker = L.marker([startStop.lat, startStop.lon]).bindPopup(`🚏 Partida: ${startStop.name}`).addTo(map);
    const destMarker = L.marker([destStop.lat, destStop.lon]).bindPopup(`🏁 Destino: ${destStop.name}`).addTo(map);
    startMarker._temp = destMarker._temp = true;

    const line = L.polyline([[startStop.lat, startStop.lon], [destStop.lat, destStop.lon]], {
      color: "#00d084", weight: 4, dashArray: "6 8"
    }).addTo(map);
    line._temp = true;
    map.fitBounds(line.getBounds(), { padding: [30, 30] });
    startMarker.openPopup();
  };
};
