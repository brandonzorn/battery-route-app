import Database from "@tauri-apps/plugin-sql";
import { getDbPath } from "./storage";

let db: Database | undefined;

export async function initDb() {
  const path = await getDbPath();
  db = await Database.load(`sqlite:${path}`);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS vehicle (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      kind TEXT NOT NULL,
      name TEXT NOT NULL,

      mass_kg REAL,
      speed_kmh REAL,

      rolling_resistance_lever_mm REAL,
      wheel_radius_mm REAL,

      drag_coefficient_cx REAL,
      frontal_area_m2 REAL,

      inefficiency_percent REAL,
      regen_efficiency_percent REAL,

      battery_voltage_v REAL,
      charger_efficiency_percent REAL,
      bms_losses_percent REAL,
      thermal_losses_percent REAL
    );
  `);
}

export function getDb(): Database {
  if (!db) throw new Error("DB not initialized");
  return db;
}