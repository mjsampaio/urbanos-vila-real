export async function getBusRoute(tripId, originStopId, destinationStopId) {
  const [stopTimesRes, stopsRes] = await Promise.all([
    fetch("/data/stop_times.json"),
    fetch("/data/stops.json"),
  ]);

  const stopTimes = await stopTimesRes.json();
  const stops = await stopsRes.json();

  const tripStops = stopTimes
    .filter((s) => s.trip_id === tripId)
    .sort((a, b) => a.stop_sequence - b.stop_sequence);

  const startIndex = tripStops.findIndex((s) => s.stop_id === originStopId);
  const endIndex = tripStops.findIndex((s) => s.stop_id === destinationStopId);

  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) return [];

  const routeSegment = tripStops.slice(startIndex, endIndex + 1);

  const routeCoords = routeSegment.map((stopTime) => {
    const stop = stops.find((s) => s.stop_id === stopTime.stop_id);
    return [parseFloat(stop.stop_lat), parseFloat(stop.stop_lon)];
  });

  return routeCoords;
}
