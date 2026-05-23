const storeModel = require('../models/storeModel');

const GOOGLE_DISTANCE_MATRIX_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';

const buildRouteDetails = async (origin, stores) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey || typeof fetch !== 'function' || stores.length === 0) {
    return null;
  }

  const url = new URL(GOOGLE_DISTANCE_MATRIX_URL);
  url.searchParams.set('origins', `${origin.lat},${origin.lng}`);
  url.searchParams.set('destinations', stores.map((store) => `${store.latitude},${store.longitude}`).join('|'));
  url.searchParams.set('units', 'metric');
  url.searchParams.set('key', apiKey);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Maps API request failed with status ${response.status}`);
  }

  const data = await response.json();
  if (data.status !== 'OK' || !Array.isArray(data.rows) || !data.rows[0]) {
    throw new Error(`Google Maps API returned status ${data.status || 'UNKNOWN'}`);
  }

  return data.rows[0].elements || [];
};

const enrichStoresWithRouteData = (stores, routeElements) => {
  return stores.map((store, index) => {
    const element = routeElements[index] || {};
    const straightLineDistanceKm = Number.isFinite(Number(store.distance_km)) ? Number(store.distance_km) : null;
    const routeDistanceKm = element.distance?.value != null ? element.distance.value / 1000 : null;
    const routeDurationMinutes = element.duration?.value != null ? element.duration.value / 60 : null;
    const routeDurationSeconds = element.duration?.value != null ? element.duration.value : null;

    return {
      ...store,
      distance: routeDistanceKm ?? straightLineDistanceKm,
      straight_line_distance_km: straightLineDistanceKm,
      route_distance_km: routeDistanceKm,
      route_duration_minutes: routeDurationMinutes,
      route_duration_seconds: routeDurationSeconds,
      google_route_status: element.status || 'UNKNOWN'
    };
  });
};

const listStores = async (req, res) => {
  try {
    const stores = await storeModel.getAllStores();
    res.json({ stores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const nearestStores = async (req, res) => {
  try {
    const { lat, lng, limit = 3 } = req.query;
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    const parsedLimit = Number(limit);

    if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
      return res.status(400).json({ message: 'lat and lng are required' });
    }

    const finalLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 3;
    const candidateLimit = Math.min(Math.max(finalLimit * 5, 5), 25);
    const candidates = await storeModel.getNearestStores(parsedLat, parsedLng, candidateLimit);

    let stores = candidates.slice(0, finalLimit);

    try {
      const routeElements = await buildRouteDetails({ lat: parsedLat, lng: parsedLng }, candidates);
      if (routeElements) {
        const enrichedStores = enrichStoresWithRouteData(candidates, routeElements);
        const rankedStores = enrichedStores
          .filter((store) => store.google_route_status === 'OK' && Number.isFinite(store.route_duration_seconds))
          .sort((a, b) => a.route_duration_seconds - b.route_duration_seconds || a.route_distance_km - b.route_distance_km || a.straight_line_distance_km - b.straight_line_distance_km);
        const fallbackStores = enrichedStores.filter((store) => !(store.google_route_status === 'OK' && Number.isFinite(store.route_duration_seconds)));

        stores = [...rankedStores, ...fallbackStores].slice(0, finalLimit);
      }
    } catch (routeErr) {
      console.warn('Google Maps route lookup failed, falling back to straight-line distance', routeErr.message);
    }

    res.json({ stores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getStoreDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'store id is required' });
    
    const store = await storeModel.getStoreById(Number(id));
    if (!store) return res.status(404).json({ message: 'Store not found' });
    
    res.json({ store });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  listStores,
  getStoreDetail,
  nearestStores
};
