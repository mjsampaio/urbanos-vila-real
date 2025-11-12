function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function findNearestStop(coords) {
  const response = await fetch("/data/stops.json");
  const stops = await response.json();

  let nearestStop = null;
  let minDistance = Infinity;

  stops.forEach((stop) => {
    const dist = haversine(
      coords[0],
      coords[1],
      parseFloat(stop.stop_lat),
      parseFloat(stop.stop_lon)
    );
    if (dist < minDistance) {
      minDistance = dist;
      nearestStop = {
        id: stop.stop_id,
        name: stop.stop_name,
        coords: [parseFloat(stop.stop_lat), parseFloat(stop.stop_lon)],
        distance: dist,
      };
    }
  });

  return nearestStop;
}
