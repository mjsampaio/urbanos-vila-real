const HISTORY_KEY = "urbanos_vr_history";
const FAVORITES_KEY = "urbanos_vr_favorites";

export function saveHistory(route) {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

  const exists = history.find(
    (r) => r.origem === route.origem && r.destino === route.destino
  );
  if (!exists) {
    history.unshift({ ...route, date: new Date().toISOString() });
  }

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 5)));
}

export function getHistory() {
  return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
}

export function toggleFavorite(route) {
  const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];

  const index = favorites.findIndex(
    (r) => r.origem === route.origem && r.destino === route.destino
  );

  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.push(route);
  }

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function getFavorites() {
  return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
}

export function isFavorite(route) {
  const favorites = getFavorites();
  return favorites.some(
    (r) => r.origem === route.origem && r.destino === route.destino
  );
}
