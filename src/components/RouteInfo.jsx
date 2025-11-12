import { useState, useEffect } from "react";
import { Star, StarOff } from "lucide-react";
import { isFavorite, toggleFavorite } from "../utils/storage";

export default function RouteInfo({ info }) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isFavorite(info));
  }, [info]);

  const handleFavorite = () => {
    toggleFavorite(info);
    setFav(!fav);
  };

  if (!info) return null;

  return (
    <div className="p-3 bg-white shadow-md border-t">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Detalhes da viagem</h2>
        {fav ? (
          <Star className="text-yellow-500 cursor-pointer" onClick={handleFavorite} />
        ) : (
          <StarOff className="text-gray-400 cursor-pointer" onClick={handleFavorite} />
        )}
      </div>
      <p><strong>Linha:</strong> {info.linha}</p>
      <p><strong>Direção:</strong> {info.direcao}</p>
      <p><strong>Partida:</strong> {info.partida}</p>
      <p><strong>Destino:</strong> {info.destino}</p>
      <p><strong>Próximo autocarro:</strong> {info.proximoHorario}</p>
      <p><strong>A pé até à paragem:</strong> {info.distanciaAPeInicio} km</p>
      <p><strong>Do autocarro até ao destino:</strong> {info.distanciaAPeFim} km</p>
    </div>
  );
}
