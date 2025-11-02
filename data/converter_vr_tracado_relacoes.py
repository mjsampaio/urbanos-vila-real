import json
from collections import defaultdict

# Caminhos de ficheiros
input_file = "dados_vr.json"
output_file = "vr_bus.json"

print("🚍 A processar ficheiro OSM com relations...")

with open(input_file, "r", encoding="utf-8") as f:
    data = json.load(f)

elements = data.get("elements", [])
stops = {}
ways = {}
routes = defaultdict(lambda: {"stops": [], "geometry": []})

# --- 1️⃣ Extrair paragens ---
for el in elements:
    if el.get("type") == "node" and el.get("tags", {}).get("highway") == "bus_stop":
        stop_id = el["id"]
        name = el.get("tags", {}).get("name", f"Paragem {stop_id}")
        lat, lon = el.get("lat"), el.get("lon")
        stops[stop_id] = {"id": stop_id, "name": name, "lat": lat, "lon": lon}

# --- 2️⃣ Extrair ways com geometria ---
for el in elements:
    if el.get("type") == "way" and "geometry" in el:
        ways[el["id"]] = [[p["lat"], p["lon"]] for p in el["geometry"]]

# --- 3️⃣ Ler relations (linhas de autocarro completas) ---
for el in elements:
    if el.get("type") == "relation":
        tags = el.get("tags", {})
        net = tags.get("network") or tags.get("ref") or tags.get("name")
        if not net:
            continue
        route_name = tags.get("name", f"Linha {net}")
        way_geometries = []
        stop_ids = []

        for m in el.get("members", []):
            if m["type"] == "node" and m["ref"] in stops:
                stop_ids.append(m["ref"])
            elif m["type"] == "way" and m["ref"] in ways:
                way_geometries.extend(ways[m["ref"]])

        if way_geometries:
            routes[net]["geometry"] = way_geometries
        if stop_ids:
            routes[net]["stops"] = stop_ids
        routes[net]["name"] = route_name

# --- 4️⃣ Criar estrutura final ---
output = {
    "stops": list(stops.values()),
    "routes": []
}

for net, info in routes.items():
    output["routes"].append({
        "route_id": str(net),
        "name": info.get("name", f"Linha {net}"),
        "stops": info.get("stops", []),
        "geometry": info.get("geometry", [])
    })

# --- 5️⃣ Gravar ficheiro final ---
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"✅ Conversão completa: {len(output['routes'])} linhas exportadas.")
print(f"💾 Ficheiro gerado: {output_file}")
