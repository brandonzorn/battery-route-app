import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [vue()],
    server: {
      host: env.VITE_APP_HOST ? env.VITE_APP_HOST : "localhost",
      port: env.VITE_APP_PORT ? Number(env.VITE_APP_PORT) : 5173,
      watch: {
        ignored: ["**/src-tauri/target/**"]
      }
    }
  }
})
