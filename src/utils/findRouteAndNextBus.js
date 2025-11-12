export async function findRouteAndNextBus(originStopId, destinationStopId) {
  const [tripsRes, stopTimesRes, routesRes] = await Promise.all([
    fetch("/data/trips.json"),
    fetch("/data/stop_times.json"),
    fetch("/data/routes.json"),
  ]);

  const trips = await tripsRes.json();
  const stopTimes = await stopTimesRes.json();
  const routes = await routesRes.json();

  const tripsWithOrigin = stopTimes.filter(
    (s) => s.stop_id === originStopId
  ).map((s) => s.trip_id);

  const tripsWithDestination = stopTimes.filter(
    (s) => s.stop_id === destinationStopId
  ).map((s) => s.trip_id);

  const commonTrips = tripsWithOrigin.filter((trip) =>
    tripsWithDestination.includes(trip)
  );

  if (commonTrips.length === 0) {
    return { found: false, message: "Nenhuma linha direta encontrada." };
  }

  for (const tripId of commonTrips) {
    const stopsForTrip = stopTimes
      .filter((s) => s.trip_id === tripId)
      .sort((a, b) => a.stop_sequence - b.stop_sequence);

    const originIndex = stopsForTrip.findIndex((s) => s.stop_id === originStopId);
    const destIndex = stopsForTrip.findIndex((s) => s.stop_id === destinationStopId);

    if (originIndex !== -1 && destIndex !== -1 && originIndex < destIndex) {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}:00`;

      const originStopTimes = stopsForTrip.filter(
        (s) => s.stop_id === originStopId && s.departure_time >= currentTime
      );

      let nextTime;
      if (originStopTimes.length > 0) {
        nextTime = originStopTimes[0].departure_time;
      } else {
        nextTime = stopsForTrip.find((s) => s.stop_id === originStopId).departure_time;
      }

      const tripInfo = trips.find((t) => t.trip_id === tripId);
      const routeInfo = routes.find((r) => r.route_id === tripInfo.route_id) || {};

      return {
        found: true,
        tripId,
        linha: `${routeInfo.route_short_name || routeInfo.route_id || ''} - ${routeInfo.route_long_name || ''}`,
        direcao: tripInfo.trip_headsign,
        proximoHorario: nextTime.slice(0, 5),
      };
    }
  }

  return { found: false, message: "Nenhuma linha direta encontrada." };
}
