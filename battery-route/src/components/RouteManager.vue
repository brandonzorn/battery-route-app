<script setup lang="ts">
import SidebarSection from './SidebarSection.vue';
import type { RouteData } from '../types/route';

const props = defineProps<{
  route: RouteData;
  hasStart: boolean;
  hasEnd: boolean;
  isElevationLoading: boolean;
  elevationError: string | null;
}>();

defineEmits<{
  (e: 'reset'): void;
}>();
</script>

<template>
  <SidebarSection title="Маршрут" icon="fas fa-route">
    <div class="instruction">
      <i class="fas fa-mouse-pointer"></i> <strong>Управление:</strong><br>
      • <strong>Перетаскивание мыши</strong> — навигация по карте<br>
      • <strong><span class="key-hint">Ctrl</span> + клик</strong> — установка точек<br>
      • <strong><span class="key-hint">⌘ Cmd</span> + клик</strong> — на Mac
    </div>

    <div v-if="route.distance" class="input-group">
      <label><i class="fas fa-road"></i> Расстояние, км</label>
      <input type="number" :value="route.distance" step="0.1" readonly>
    </div>
    <div v-if="route.delta_h" class="input-group">
      <label><i class="fas fa-mountain"></i> Набор высоты, м</label>
      <input type="number" :value="route.delta_h" step="10" readonly>
    </div>
    <div v-if="route.total_descent" class="input-group">
      <label><i class="fas fa-mountain"></i> Спуск, м</label>
      <input type="number" :value="route.total_descent" step="10" readonly>
    </div>

    <div v-if="isElevationLoading" class="loading">
      <div class="text-center">⏳ Получение высоты...</div>
    </div>

    <div v-if="elevationError" class="error">
      <div class="text-center">❌ Ошибка получения высоты: {{ elevationError }}</div>
    </div>

    <div class="route-info">
      <span v-if="!props.hasStart">
        🗺️ <strong>Ожидание маршрута</strong><br>📍 Нажмите <span class="key-hint">Ctrl</span> + клик для выбора старта
      </span>
      <span v-else-if="props.hasStart && !props.hasEnd">
        ✅ <strong>СТАРТ выбран</strong><br>📍 Нажмите <span class="key-hint">Ctrl</span> + клик для выбора ФИНИША
      </span>
      <span v-else>
        ✅ <strong>Маршрут построен!</strong><br>📏 Расстояние: {{ props.route.distance }} км<br>🗺️ Перетаскивайте карту для навигации
      </span>
    </div>

    <div class="btn-group">
      <button @click="$emit('reset')" class="btn-danger">
        <i class="fas fa-trash-alt"></i> Сбросить
      </button>
    </div>
  </SidebarSection>
</template>
