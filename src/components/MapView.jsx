import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

function FlyToLocations({ origin, destination }) {
  const map = useMap();

  useEffect(() => {
    if (origin && destination) {
      const bounds = [origin.coords, destination.coords];
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (origin) {
      map.flyTo(origin.coords, 15);
    } else if (destination) {
      map.flyTo(destination.coords, 15);
    }
  }, [origin, destination, map]);

  return null;
}

export default function MapView({ origin, destination, mapData }) {
  const defaultPos = [41.3006, -7.7441];

  return (
    <div className="flex-grow">
      <MapContainer center={defaultPos} zoom={13} className="w-full h-96 z-0">
        <TileLayer
          attribution='&copy; <a href="https://osm.org">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToLocations origin={origin} destination={destination} />

        {origin && <Marker position={origin.coords}><Popup>Origem</Popup></Marker>}
        {destination && <Marker position={destination.coords}><Popup>Destino</Popup></Marker>}

        {mapData?.stops?.map((stop, idx) => (
          <Marker key={idx} position={stop.coords}>
            <Popup>{stop.name}</Popup>
          </Marker>
        ))}

        {mapData?.busRoute && <Polyline positions={mapData.busRoute} weight={5} />}
        {mapData?.walkToStop && (
          <Polyline positions={mapData.walkToStop} dashArray="5,10" />
        )}
        {mapData?.walkFromStop && (
          <Polyline positions={mapData.walkFromStop} dashArray="5,10" />
        )}
      </MapContainer>
    </div>
  );
}
