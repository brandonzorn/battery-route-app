export interface RouteData {
  distance: number;
  delta_h: number;
  total_descent: number;
}

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Elevation {
  ascent: number;
  descent: number;
}