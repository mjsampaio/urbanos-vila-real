export async function getWalkingRoute(start, end) {
  const apiKey = import.meta.env.VITE_ORS_KEY;

  if (!apiKey) {
    // no ORS key: return simple straight-line route and zero distance
    return { route: [start, end], distance: 0 };
  }

  const url = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${apiKey}`;

  const body = {
    coordinates: [
      [start[1], start[0]],
      [end[1], end[0]],
    ],
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    const route = data.features[0].geometry.coordinates.map((c) => [c[1], c[0]]);
    const distance = (data.features[0].properties.summary.distance / 1000).toFixed(2);
    return { route, distance };
  } catch (err) {
    console.error("Erro ao obter rota a pé:", err);
    return { route: [start, end], distance: 0 };
  }
}
