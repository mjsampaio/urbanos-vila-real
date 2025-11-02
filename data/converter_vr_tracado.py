import json
from collections import defaultdict

# Caminhos de ficheiro
input_file = "dados_vr.json"   # ficheiro original (Overpass API JSON)
output_file = "vr_bus.json"    # ficheiro convertido

print("🔄 A processar ficheiro OSM...")

# Ler ficheiro original
with open(input_file, "r", encoding="utf-8") as f:
    data = json.load(f)

elements = data.get("elements", [])
stops = {}
routes = defaultdict(lambda: {"stops": [], "geometry": []})

# --- 1️⃣ Extrair paragens ---
for el in elements:
    if el.get("type") == "node":
        tags = el.get("tags", {})
        if tags.get("highway") == "bus_stop":
            stop_id = el["id"]
            name = tags.get("name", f"Paragem {stop_id}")
            lat = el.get("lat")
            lon = el.get("lon")
            network = tags.get("network")
            # guardar paragem
            stops[stop_id] = {"id": stop_id, "name": name, "lat": lat, "lon": lon}
            # associar a rede
            if network:
                for net in str(network).split(";"):
                    net = net.strip()
                    if net:
                        routes[net]["stops"].append(stop_id)

# --- 2️⃣ Extrair traçados reais (ways) ---
for el in elements:
    if el.get("type") == "way" and "geometry" in el:
        ref = el.get("ref") or str(el.get("id"))
        geom = el["geometry"]
        # alguns ficheiros têm o network na relação, mas aqui não há; por isso agregamos tudo
        # se tiveres o network noutro campo, adapta aqui:
        for net_id in routes.keys():
            routes[net_id]["geometry"].extend([[p["lat"], p["lon"]] for p in geom])

# --- 3️⃣ Criar estrutura final ---
output = {
    "stops": list(stops.values()),
    "routes": []
}

for net, info in routes.items():
    # eliminar duplicados mantendo ordem
    seen = set()
    clean_stops = [s for s in info["stops"] if not (s in seen or seen.add(s))]
    output["routes"].append({
        "route_id": net,
        "name": f"Linha {net}",
        "stops": clean_stops,
        "geometry": info["geometry"]
    })

# --- 4️⃣ Gravar ficheiro final ---
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"✅ Conversão concluída com sucesso!")
print(f"💾 Ficheiro gravado como: {output_file}")
print(f"📍 Paragens: {len(stops)} | Rotas: {len(output['routes'])}")
