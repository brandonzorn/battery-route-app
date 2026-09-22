import { type VehicleConfig } from "../types/calculator";
import { getDb } from "./database";

type Row = Record<string, any>;

function mapVehicle(row: any): VehicleConfig {
  return {
    id: row.id,
    kind: row.kind,
    name: row.name,
    mass_kg: row.mass_kg,
    speed_kmh: row.speed_kmh,
    rolling_resistance_lever_mm: row.rolling_resistance_lever_mm,
    wheel_radius_mm: row.wheel_radius_mm,
    drag_coefficient_cx: row.drag_coefficient_cx,
    frontal_area_m2: row.frontal_area_m2,
    inefficiency_percent: row.inefficiency_percent,
    regen_efficiency_percent: row.regen_efficiency_percent,
    battery_voltage_v: row.battery_voltage_v,
    charger_efficiency_percent: row.charger_efficiency_percent,
    bms_losses_percent: row.bms_losses_percent,
    thermal_losses_percent: row.thermal_losses_percent,
  };
}

export async function fetchVehicles(): Promise<VehicleConfig[]> {
  const db = getDb();
  const rows = await db.select("SELECT * FROM vehicle") as Row[];

  return rows.map(mapVehicle);
}

export async function getVehicle(id: number): Promise<VehicleConfig | null> {
  const db = getDb();
  const rows = await db.select("SELECT * FROM vehicle WHERE id = ?", [id]) as Row[];

  if (!rows.length) return null;

  return mapVehicle(rows[0]);
}

export async function addVehicle(v: VehicleConfig) {
  const db = getDb();
  await db.execute(
    `INSERT INTO vehicle (
      kind, name,
      mass_kg, speed_kmh,
      rolling_resistance_lever_mm, wheel_radius_mm,
      drag_coefficient_cx, frontal_area_m2,
      inefficiency_percent, regen_efficiency_percent,
      battery_voltage_v, charger_efficiency_percent,
      bms_losses_percent, thermal_losses_percent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      v.kind,
      v.name,
      v.mass_kg,
      v.speed_kmh,
      v.rolling_resistance_lever_mm,
      v.wheel_radius_mm,
      v.drag_coefficient_cx,
      v.frontal_area_m2,
      v.inefficiency_percent,
      v.regen_efficiency_percent,
      v.battery_voltage_v,
      v.charger_efficiency_percent,
      v.bms_losses_percent,
      v.thermal_losses_percent,
    ]
  );
}

export async function updateVehicle(id: number, v: Partial<VehicleConfig>) {
  const db = getDb();
  await db.execute(
    `UPDATE vehicle SET
      kind = ?,
      name = ?,
      mass_kg = ?,
      speed_kmh = ?
    WHERE id = ?`,
    [v.kind, v.name, v.mass_kg, v.speed_kmh, id]
  );
}

export async function deleteVehicle(id: number) {
  const db = getDb();
  await db.execute("DELETE FROM vehicle WHERE id = ?", [id]);
}

export async function clearVehicles() {
  const db = getDb();
  await db.execute("DELETE FROM vehicle");
}