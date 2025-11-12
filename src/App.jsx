import { useState } from "react";
import MapView from "./components/MapView";
import SearchBox from "./components/SearchBox";
import RouteInfo from "./components/RouteInfo";
import HistoryPanel from "./components/HistoryPanel";
import { findNearestStop } from "./utils/findNearestStop";
import { findRouteAndNextBus } from "./utils/findRouteAndNextBus";
import { getBusRoute } from "./utils/getBusRoute";
import { getWalkingRoute } from "./utils/getWalkingRoute";
import { saveHistory } from "./utils/storage";

export default function App() {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [mapData, setMapData] = useState(null);

  const handleSearch = async (origem, destino) => {
    setOrigin(origem);
    setDestination(destino);

    const origemStop = await findNearestStop(origem.coords);
    const destinoStop = await findNearestStop(destino.coords);

    const rota = await findRouteAndNextBus(origemStop.id, destinoStop.id);

    if (!rota.found) {
      setRouteInfo({
        linha: "—",
        partida: origemStop.name,
        destino: destinoStop.name,
        proximoHorario: "Sem ligação direta",
      });
      setMapData(null);
      return;
    }

    const busRoute = await getBusRoute(rota.tripId, origemStop.id, destinoStop.id);
    const walkToStop = await getWalkingRoute(origem.coords, origemStop.coords);
    const walkFromStop = await getWalkingRoute(destinoStop.coords, destino.coords);

    const newRoute = {
      origem: origem.name,
      destino: destino.name,
      linha: rota.linha,
      direcao: rota.direcao,
      proximoHorario: rota.proximoHorario,
    };

    saveHistory(newRoute);

    setRouteInfo({
      ...newRoute,
      partida: origemStop.name,
      chegada: destinoStop.name,
      distanciaAPeInicio: walkToStop.distance,
      distanciaAPeFim: walkFromStop.distance,
    });

    setMapData({
      busRoute,
      walkToStop: walkToStop.route,
      walkFromStop: walkFromStop.route,
      stops: [origemStop, destinoStop],
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white text-center p-3 font-semibold shadow">
        Urbanos Vila Real
      </header>

      <main className="flex flex-col flex-grow">
        <SearchBox onSearch={handleSearch} />
        <HistoryPanel onSelect={(orig, dest) => handleSearch(orig, dest)} />
        <MapView origin={origin} destination={destination} mapData={mapData} />
        {routeInfo && <RouteInfo info={routeInfo} />}
      </main>

      <footer className="text-center text-sm text-gray-500 py-2">
        © 2025 Urbanos VR – Beta
      </footer>
    </div>
  );
}
