export async function geocodeAddress(address) {
  if (!address) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    address
  )}&addressdetails=1&limit=1&countrycodes=pt`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "UrbanosVR/1.0" },
    });
    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return {
        name: result.display_name,
        coords: [parseFloat(result.lat), parseFloat(result.lon)],
      };
    }
    return null;
  } catch (error) {
    console.error("Erro na geocodificação:", error);
    return null;
  }
}
