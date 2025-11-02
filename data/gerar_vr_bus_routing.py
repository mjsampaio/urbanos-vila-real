import json
import time
import requests

input_file = "vr_bus.json"
output_file = "vr_bus_routing.json"

OSRM_URL = "https://router.project-osrm.org/route/v1/driving"

print("🚍 A gerar traçados reais via OSRM...")
print("💡 Isto pode demorar alguns minutos (1-2 segundos por rota).")

# Carregar dados base
with open(input_file, "r", encoding="utf-8") as f:
    data = json.load(f)

routes = data.get("routes", [])
stops_dict = {s["id"]: s for s in data.get("stops", [])}

for i, route in enumerate(routes, start=1):
    print(f"\n➡️ Processar rota {i}/{len(routes)}: {route['name']}")

    coords = []
    for sid in route.get("stops", []):
        s = stops_dict.get(sid)
        if s:
            coords.append((s["lon"], s["lat"]))  # ordem para OSRM: lon,lat

    # se houver poucas paragens, ignora
    if len(coords) < 2:
        print("   ⚠️ Poucas paragens, ignorado.")
        continue

    # Construir URL
    url = f"{OSRM_URL}/" + ";".join([f"{lon},{lat}" for lon, lat in coords])
    params = {"overview": "full", "geometries": "geojson"}

    try:
        r = requests.get(url, params=params, timeout=30)
        r.raise_for_status()
        resp = r.json()
        if resp.get("routes"):
            geometry = resp["routes"][0]["geometry"]["coordinates"]
            route["geometry_real"] = [[lat, lon] for lon, lat in geometry]
            print(f"   ✅ {len(route['geometry_real'])} pontos de percurso gerados.")
        else:
            print("   ⚠️ Nenhum trajeto devolvido pelo OSRM.")
    except Exception as e:
        print(f"   ❌ Erro a processar rota {route['name']}: {e}")

    # pequena pausa para não sobrecarregar o servidor
    time.sleep(1.5)

# Gravar novo ficheiro
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("\n🎯 Ficheiro gerado com sucesso!")
print(f"💾 {output_file}")
