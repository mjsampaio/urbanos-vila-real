# Urbanos VR - PWA (Vite + React)

Projeto minimal para uma PWA que usa dados GTFS convertidos para JSON.
Inclui funcionalidades:
- Geocodificação via Nominatim (OpenStreetMap)
- Encontrar paragens mais próximas (stops.json)
- Identificar linha e próximo horário (stop_times.json, trips.json, routes.json)
- Traçar rota do autocarro e caminhos a pé (com OpenRouteService opcional)
- Histórico e Favoritos (localStorage)
- Mapa com Leaflet

## Como usar (localmente)

1. Instalar dependências:
```bash
npm install
```

2. Executar em modo desenvolvimento:
```bash
npm run dev
```

3. Build:
```bash
npm run build
```

## Notas importantes
- Se quiseres rotas de caminhada mais precisas, cria uma conta em https://openrouteservice.org e coloca a chave em `.env` como `VITE_ORS_KEY=xxxxx`.
- Os ficheiros GTFS em JSON estão em `public/data/`.
- Para deploy estático em Render, empurra o repositório GitHub e configura um Static Site apontando para o branch principal.

