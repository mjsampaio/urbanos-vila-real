import { useState } from "react";
import { geocodeAddress } from "../utils/geocodeAddress";

export default function SearchBox({ onSearch }) {
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!origem || !destino) return;

    setLoading(true);

    const origemCoords = await geocodeAddress(origem);
    const destinoCoords = await geocodeAddress(destino);

    setLoading(false);

    if (origemCoords && destinoCoords) {
      onSearch(origemCoords, destinoCoords);
    } else {
      alert("Não foi possível encontrar uma ou mais moradas.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 flex flex-col gap-2 bg-gray-100 shadow-md"
    >
      <input
        type="text"
        placeholder="Origem (morada ou paragem)"
        value={origem}
        onChange={(e) => setOrigem(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Destino (morada ou paragem)"
        value={destino}
        onChange={(e) => setDestino(e.target.value)}
        className="border p-2 rounded"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white rounded p-2 mt-1 hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "A calcular..." : "Calcular rota"}
      </button>
    </form>
  );
}
