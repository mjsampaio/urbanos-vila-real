import json
from collections import defaultdict

# Caminho do ficheiro original (Overpass JSON)
input_file = "dados_vr.json"
# Caminho do ficheiro convertido
output_file = "vr_bus.json"

print("🔄 A ler ficheiro OSM...")

# Ler ficheiro original
with open(input_file, "r", encoding="utf-8") as f:
    data = json.load(f)

elements = data.get("elements", [])
stops = {}
routes = defaultdict(list)

for el in elements:
    if el.get("type") != "node":
        continue
    tags = el.get("tags", {})
    if tags.get("highway") != "bus_stop":
        continue

    stop_id = el["id"]
    name = tags.get("name", f"Paragem {stop_id}")
    lat = el.get("lat")
    lon = el.get("lon")

    # Guardar paragem única
    stops[stop_id] = {"id": stop_id, "name": name, "lat": lat, "lon": lon}

    # A mesma paragem pode pertencer a várias redes (networks)
    network = tags.get("network")
    if network:
        for net in str(network).split(";"):
            net = net.strip()
            if net:
                routes[net].append(stop_id)

print(f"✅ Total de paragens: {len(stops)}")
print(f"✅ Total de linhas (networks): {len(routes)}")

# Criar estrutura final
output = {
    "stops": list(stops.values()),
    "routes": []
}

for net, stop_ids in routes.items():
    # Remover duplicados mantendo ordem
    seen = set()
    ordered_stops = [x for x in stop_ids if not (x in seen or seen.add(x))]
    output["routes"].append({
        "route_id": net,
        "name": f"Linha {net}",
        "stops": ordered_stops
    })

# Gravar ficheiro final
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"💾 Ficheiro convertido gravado como: {output_file}")
