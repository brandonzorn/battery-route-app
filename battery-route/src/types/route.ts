export interface RouteData {
  delta_h_m: number;
  total_descent_m: number;
  distance_km: number;
}

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Elevation {
  ascent: number;
  descent: number;
}