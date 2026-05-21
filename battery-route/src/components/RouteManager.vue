<script setup lang="ts">
import { computed } from 'vue';
import SidebarSection from './SidebarSection.vue';
import type { RouteData } from '../types/calculator';

const props = defineProps<{
  route: RouteData;
  hasStart: boolean;
  hasEnd: boolean;
}>();

defineEmits<{
  (e: 'reset'): void;
}>();

const statusMessage = computed(() => {
  if (!props.hasStart) {
    return '🗺️ <strong>Статус:</strong> Ожидание маршрута<br>📍 Нажмите <span class="key-hint">Ctrl</span> + клик для выбора старта';
  }
  if (props.hasStart && !props.hasEnd) {
    return '✅ <strong>Статус:</strong> СТАРТ выбран<br>📍 Нажмите <span class="key-hint">Ctrl</span> + клик для выбора ФИНИША';
  }
  return `✅ <strong>Маршрут построен!</strong><br>📏 Расстояние: ${props.route.distance} км<br>🗺️ Перетаскивайте карту для навигации`;
});
</script>

<template>
  <SidebarSection title="Маршрут" icon="fas fa-route">
    <div class="instruction">
      <i class="fas fa-mouse-pointer"></i> <strong>Управление:</strong><br>
      • <strong>Перетаскивание мыши</strong> — навигация по карте<br>
      • <strong><span class="key-hint">Ctrl</span> + клик</strong> — установка точек<br>
      • <strong><span class="key-hint">⌘ Cmd</span> + клик</strong> — на Mac
    </div>

    <div class="input-group">
      <label><i class="fas fa-road"></i> Расстояние, км</label>
      <input type="number" :value="route.distance" step="0.1" readonly>
    </div>
    <div class="input-group">
      <label><i class="fas fa-mountain"></i> Набор высоты, м</label>
      <input type="number" :value="route.delta_h" step="10" readonly>
    </div>
    <div class="input-group">
      <label><i class="fas fa-mountain"></i> Спуск, м</label>
      <input type="number" :value="route.total_descent" step="10" readonly>
    </div>

    <div class="route-info" v-html="statusMessage"></div>

    <div class="btn-group">
      <button @click="$emit('reset')" class="btn-danger">
        <i class="fas fa-trash-alt"></i> Сбросить
      </button>
    </div>
  </SidebarSection>
</template>
