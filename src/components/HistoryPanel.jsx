import { useState, useEffect } from "react";
import { getHistory, getFavorites, toggleFavorite, isFavorite } from "../utils/storage";
import { Star, StarOff } from "lucide-react";

export default function HistoryPanel({ onSelect }) {
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    setHistory(getHistory());
    setFavorites(getFavorites());
  }, []);

  const handleFavorite = (route) => {
    toggleFavorite(route);
    setFavorites(getFavorites());
    setHistory(getHistory());
  };

  return (
    <div className="bg-gray-50 p-3 shadow-inner border-b">
      <h2 className="font-semibold mb-2">Histórico & Favoritos</h2>
      <div className="flex flex-col gap-2">
        {favorites.length > 0 && (
          <>
            <p className="text-blue-700 font-medium text-sm">⭐ Favoritos</p>
            {favorites.map((r, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-white p-2 rounded shadow-sm hover:bg-blue-50 cursor-pointer"
                onClick={() => onSelect({ name: r.origem }, { name: r.destino })}
              >
                <div>
                  <p className="font-semibold">{r.origem} → {r.destino}</p>
                  <p className="text-xs text-gray-500">{r.linha}</p>
                </div>
                <StarOff
                  size={20}
                  className="text-yellow-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavorite(r);
                  }}
                />
              </div>
            ))}
          </>
        )}

        {history.length > 0 && (
          <>
            <p className="text-blue-700 font-medium text-sm mt-2">🕘 Histórico recente</p>
            {history.map((r, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-white p-2 rounded shadow-sm hover:bg-gray-100 cursor-pointer"
                onClick={() => onSelect({ name: r.origem }, { name: r.destino })}
              >
                <div>
                  <p className="font-semibold">{r.origem} → {r.destino}</p>
                  <p className="text-xs text-gray-500">{r.linha}</p>
                </div>
                {isFavorite(r) ? (
                  <Star
                    size={20}
                    className="text-yellow-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavorite(r);
                    }}
                  />
                ) : (
                  <StarOff
                    size={20}
                    className="text-gray-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavorite(r);
                    }}
                  />
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
