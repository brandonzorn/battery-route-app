import { appDataDir, join } from "@tauri-apps/api/path";


export async function getDbPath() {
  const dbName = import.meta.env.VITE_DB_FILE_NAME;

  if (!dbName) {
    throw Error("Env variable VITE_DB_FILE_NAME is not defined")
  }

  const dir = await appDataDir();
  return await join(dir, dbName);
}