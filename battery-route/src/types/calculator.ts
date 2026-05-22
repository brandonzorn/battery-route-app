export interface VehicleConfig {
  name: string;
  mass: number;
  speed: number;
  rolling_resistance: number;
  wheel_radius: number;
  drag_coefficient: number;
  frontal_area: number;
  inefficiency: number;
  regen_efficiency: number;
  battery_voltage: number;
  charger_efficiency: number;
  bms_losses: number;
  thermal_losses: number;
}

export interface CalculationResult {
  energy: {
    climb_energy: number;
    rolling_energy: number;
    air_energy: number;
    inertia_energy: number;
    total_energy_kj: number;
    total_energy_wh: number;
  };
  battery: {
    total_efficiency: number;
    required_energy_wh: number;
    required_capacity_ah: number;
  };
}

export type PresetType = 'bike' | 'car' | 'scooter';