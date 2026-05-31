export interface VehicleConfig {
  kind: string;
  name: string;
  mass_kg: number;
  speed_kmh: number;
  rolling_resistance_crr: number;
  wheel_radius_mm: number;
  drag_coefficient_cx: number;
  frontal_area_m2: number;
  inefficiency_percent: number;
  regen_efficiency_percent: number;

  battery_voltage_v: number;
  charger_efficiency_percent: number;
  bms_losses_percent: number;
  thermal_losses_percent: number;
}

export interface CalculationResult {
  energy: {
    climb_energy_kj: number;
    rolling_energy_kj: number;
    air_energy_kj: number;
    inertia_energy_kj: number;
    total_energy_kj: number;
    total_energy_wh: number;
  };
  battery: {
    required_capacity_ah: number;
    required_energy_wh: number;
    total_efficiency_percent: number;
  };
}

export type PresetType = 'bike' | 'car' | 'scooter';