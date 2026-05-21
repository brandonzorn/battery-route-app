import axios from 'axios';
import type { VehicleConfig, RouteData, CalculationResult } from '../types/calculator';

const ELEVATION_API_URL = 'https://api.open-elevation.com/api/v1/lookup';

export const apiService = {
  async fetchElevationProfile(coordinates: { lat: number; lng: number }[]): Promise<{ ascent: number; descent: number }> {
    const points = coordinates.filter((_, i) => i % 10 === 0).slice(0, 100);

    const response = await axios.post<{ results: { elevation: number }[] }>(ELEVATION_API_URL, {
      locations: points.map(p => ({ latitude: p.lat, longitude: p.lng }))
    });

    const elevations = response.data.results.map(r => r.elevation);
    let ascent = 0;
    let descent = 0;

    for (let i = 1; i < elevations.length; i++) {
      const diff = elevations[i] - elevations[i - 1];
      if (diff > 0) ascent += diff;
      else descent -= diff;
    }

    return { ascent: Math.round(ascent), descent: Math.round(descent) };
  },


  async calculateBattery(payload: VehicleConfig & RouteData): Promise<CalculationResult> {
    const response = await axios.post<CalculationResult>('/calculate', payload);
    return response.data;
  }
};