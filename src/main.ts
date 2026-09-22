import { initDb } from './db/database';
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

try {
  await initDb();
} catch (e: any) {
  console.error(e);
}

createApp(App).mount('#app')
