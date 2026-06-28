import type { CalculationResult, VehicleConfig } from "../types/calculator";
import type { RouteData } from "../types/route";

const AIR_DENSITY = 1.2;
const G = 9.81;

const roundTo = (num: number, decimals: number): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
};

export function calculateEnergy(data: RouteData & VehicleConfig): CalculationResult {
  const distance_m = data.distance_km * 1000;
  const speed_ms = data.speed_kmh / 3.6;

  const climb_energy = data.mass_kg * G * data.total_ascent_m;

  const rolling_energy =
    (data.rolling_resistance_lever_mm / data.wheel_radius_mm) *
    data.mass_kg *
    G *
    distance_m;

  const air_energy =
    0.5 *
    data.drag_coefficient_cx *
    data.frontal_area_m2 *
    AIR_DENSITY *
    Math.pow(speed_ms, 2) *
    distance_m;

  const inertia_energy = 0.01 * data.mass_kg * G * distance_m;

  const regen_energy =
    data.mass_kg *
    G *
    data.total_descent_m *
    (data.regen_efficiency_percent / 100) *
    0.5;

  let total_energy = climb_energy + rolling_energy + air_energy + inertia_energy;
  const inefficiency_energy = total_energy * (data.inefficiency_percent / 100);

  total_energy = Math.max(0, total_energy + inefficiency_energy - regen_energy);


  let total_efficiency = (
        (data.charger_efficiency_percent / 100)
        * ((100 - data.bms_losses_percent) / 100)
        * ((100 - data.thermal_losses_percent) / 100)
    )

    if (total_efficiency <= 0) {
        total_efficiency = 0.01
    }

  let required_energy_wh = total_energy / 3600 / total_efficiency
  let required_capacity_ah = required_energy_wh / data.battery_voltage_v

  return {
    energy: {
      climb_energy_kj: roundTo(climb_energy / 1000, 2),
      rolling_energy_kj: roundTo(rolling_energy / 1000, 2),
      air_energy_kj: roundTo(air_energy / 1000, 2),
      inertia_energy_kj: roundTo(inertia_energy / 1000, 2),
      inefficiency_energy_kj: roundTo(inefficiency_energy / 1000, 2),
      regen_energy_kj: roundTo(regen_energy / 1000, 2),
      total_energy_kj: roundTo(total_energy / 1000, 2),
      total_energy_wh: roundTo(total_energy / 3600, 2),
    },
    battery: {
      required_capacity_ah: roundTo(required_capacity_ah, 2),
      required_energy_wh: roundTo(required_energy_wh, 2),
      total_efficiency_percent: roundTo(total_efficiency * 100, 2),
    },
  };
}