import json
from collections import defaultdict

input_file = "dados_vr.json"
output_file = "vr_bus.json"

print("🚍 A processar ficheiro OSM (modo híbrido)...")

with open(input_file, "r", encoding="utf-8") as f:
    data = json.load(f)

elements = data.get("elements", [])
stops = {}
ways = {}
routes = defaultdict(lambda: {"stops": [], "geometry": [], "name": None})

# --- 1️⃣ Extrair todas as paragens ---
for el in elements:
    if el.get("type") == "node":
        tags = el.get("tags", {})
        if tags.get("highway") == "bus_stop":
            stop_id = el["id"]
            name = tags.get("name", f"Paragem {stop_id}")
            lat, lon = el.get("lat"), el.get("lon")
            stops[stop_id] = {"id": stop_id, "name": name, "lat": lat, "lon": lon}

            # associar a redes conhecidas
            network = tags.get("network") or tags.get("bus_routes") or tags.get("ref")
            if network:
                for net in str(network).split(";"):
                    net = net.strip()
                    if net:
                        routes[net]["stops"].append(stop_id)
                        if not routes[net]["name"]:
                            routes[net]["name"] = f"Linha {net}"

# --- 2️⃣ Guardar todas as ways (traçados) ---
for el in elements:
    if el.get("type") == "way" and "geometry" in el:
        ways[el["id"]] = [[p["lat"], p["lon"]] for p in el["geometry"]]
        # associar por network se existir
        tags = el.get("tags", {})
        network = tags.get("network") or tags.get("ref")
        if network:
            for net in str(network).split(";"):
                net = net.strip()
                if net:
                    routes[net]["geometry"].extend([[p["lat"], p["lon"]] for p in el["geometry"]])
                    if not routes[net]["name"]:
                        routes[net]["name"] = f"Linha {net}"

# --- 3️⃣ Ler relations se existirem ---
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

        # substituir ou complementar rota existente
        if stop_ids:
            routes[net]["stops"] = stop_ids
        if way_geometries:
            routes[net]["geometry"] = way_geometries
        routes[net]["name"] = route_name

# --- 4️⃣ Criar estrutura final ---
output = {
    "stops": list(stops.values()),
    "routes": []
}

for net, info in routes.items():
    seen = set()
    clean_stops = [s for s in info["stops"] if not (s in seen or seen.add(s))]
    output["routes"].append({
        "route_id": str(net),
        "name": info["name"] or f"Linha {net}",
        "stops": clean_stops,
        "geometry": info["geometry"]
    })

# --- 5️⃣ Gravar resultado ---
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("✅ Conversão concluída.")
print(f"📍 Paragens: {len(stops)} | Linhas: {len(output['routes'])}")
print(f"💾 Ficheiro gerado: {output_file}")
