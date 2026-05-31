import axios from 'axios';
import type { VehicleConfig, CalculationResult } from '../types/calculator';
import type { RouteData, Coordinate, Elevation } from '../types/route';


const API_BASE = import.meta.env.VITE_API_BASE;
const ELEVATION_API_BASE = 'https://api.open-elevation.com/api/v1/';

const api = axios.create({
  baseURL: API_BASE,
});
const elevationApi = axios.create({
  baseURL: ELEVATION_API_BASE
});

export async function fetchElevationProfile(coordinates: Coordinate[], signal?: AbortSignal): Promise<Elevation> {
  const points = coordinates.filter((_, i) => i % 10 === 0).slice(0, 25);

  const response = await elevationApi.post<{ results: { elevation: number }[] }>("/lookup", {
    locations: points.map(p => ({ latitude: p.lat, longitude: p.lng }))
  }, { signal }
  );

  const elevations = response.data.results.map(r => r.elevation);
  let ascent = 0;
  let descent = 0;

  for (let i = 1; i < elevations.length; i++) {
    const diff = elevations[i] - elevations[i - 1];
    if (diff > 0) ascent += diff;
    else descent -= diff;
  }

  return { ascent: Math.round(ascent), descent: Math.round(descent) };
}

export async function calculateBattery(payload: VehicleConfig & RouteData, signal?: AbortSignal): Promise<CalculationResult> {
  const response = await api.post<CalculationResult>('/calculate', payload, { signal });
  return response.data;
}

export async function fetchVehicles(signal?: AbortSignal): Promise<VehicleConfig[]> {
  const response = await api.get<VehicleConfig[]>('/vehicles', { signal });
  return response.data;
}