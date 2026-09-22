import axios from 'axios';
import type { CalculationResult, VehicleConfig } from '../types/calculator';
import type { Coordinate, Elevation, RouteData } from '../types/route';
import { calculateEnergy } from './calculation';
import { getDb } from '../db/database';

const ELEVATION_API_BASE = 'https://api.open-elevation.com/api/v1/';

const elevationApi = axios.create({
  baseURL: ELEVATION_API_BASE
});

export async function fetchElevationProfile(coordinates: Coordinate[], signal?: AbortSignal): Promise<Elevation> {
  const points = coordinates.filter((_, i) => i % 10 === 0).slice(0, 25);

  const response = await elevationApi.post<{ results: { elevation: number }[] }>(
    "/lookup", {
      locations: points.map(p => ({ latitude: p.lat, longitude: p.lng }))
    },
    { signal }
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

export function calculateBattery(payload: RouteData & VehicleConfig): CalculationResult {
  return calculateEnergy(payload);
}

export async function fetchVehicles(signal?: AbortSignal): Promise<VehicleConfig[]> {
  const db = getDb();
  const result = await db.select<VehicleConfig[]>("SELECT * FROM vehicle");

  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  return result;
}