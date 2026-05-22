<script setup lang="ts">
import SidebarSection from './SidebarSection.vue';
import type { VehicleConfig, PresetType } from '../types/calculator';
import { onMounted } from 'vue';

const modelValue = defineModel<VehicleConfig>({ required: true });

const PRESETS: Record<PresetType, VehicleConfig> = {
  bike: {
    name: "", mass: 100, speed: 25, rolling_resistance: 2, wheel_radius: 350,
    drag_coefficient: 1.0, frontal_area: 0.4, inefficiency: 10, regen_efficiency: 10,
    battery_voltage: 48, charger_efficiency: 85, bms_losses: 5, thermal_losses: 5
  },
  car: {
    name: "", mass: 1500, speed: 60, rolling_resistance: 2, wheel_radius: 320,
    drag_coefficient: 0.35, frontal_area: 2.2, inefficiency: 10, regen_efficiency: 60,
    battery_voltage: 400, charger_efficiency: 85, bms_losses: 5, thermal_losses: 5
  },
  scooter: {
    name: "", mass: 85, speed: 20, rolling_resistance: 2.5, wheel_radius: 200,
    drag_coefficient: 1.1, frontal_area: 0.3, inefficiency: 10, regen_efficiency: 5,
    battery_voltage: 36, charger_efficiency: 85, bms_losses: 5, thermal_losses: 5
  }
};

onMounted(() => {
  selectPreset("bike");
});

const selectPreset = (type: PresetType) => {
  modelValue.value = { ...PRESETS[type] };
};
</script>

<template>
  <SidebarSection title="Транспортное средство" icon="fas fa-motorcycle">
    <div class="preset-buttons">
    <button class="preset-btn" @click="selectPreset('bike')">
      <i class="fas fa-bicycle"></i> Вело
    </button>
    <button class="preset-btn" @click="selectPreset('car')">
      <i class="fas fa-car"></i> Авто
    </button>
    <button class="preset-btn" @click="selectPreset('scooter')">
      <i class="fas fa-motorcycle"></i> Самокат
    </button>
  </div>
    <div class="input-group">
      <label><i class="fas fa-weight-hanging"></i> Масса с водителем, кг</label>
      <input type="number" v-model.number="modelValue.mass" step="10">
    </div>
    <div class="input-group">
      <label><i class="fas fa-tachometer-alt"></i> Скорость, км/ч</label>
      <input type="number" v-model.number="modelValue.speed" step="5">
    </div>
    <div class="input-group">
      <label><i class="fas fa-tire"></i> Трение качения, мм</label>
      <input type="number" v-model.number="modelValue.rolling_resistance" step="0.5">
    </div>
    <div class="input-group">
      <label><i class="fas fa-circle"></i> Радиус колеса, мм</label>
      <input type="number" v-model.number="modelValue.wheel_radius" step="10">
    </div>
    <div class="input-group">
      <label><i class="fas fa-wind"></i> Cx (аэродинамика)</label>
      <input type="number" v-model.number="modelValue.drag_coefficient" step="0.05">
    </div>
    <div class="input-group">
      <label><i class="fas fa-arrows-alt"></i> Площадь миделя, м²</label>
      <input type="number" v-model.number="modelValue.frontal_area" step="0.05">
    </div>
    <div class="input-group">
      <label><i class="fas fa-percent"></i> Неучтенные потери, %</label>
      <input type="number" v-model.number="modelValue.inefficiency" step="5">
    </div>
  </SidebarSection>

  <SidebarSection title="Рекуперация" icon="fas fa-bolt">
    <div class="input-group">
      <label><i class="fas fa-sync-alt"></i> Эффективность, %</label>
      <input type="number" v-model.number="modelValue.regen_efficiency" step="5">
    </div>
  </SidebarSection>

  <SidebarSection title="Аккумулятор и зарядка" icon="fas fa-battery-full">
    <div class="input-group">
      <label><i class="fas fa-charging-station"></i> Напряжение АКБ, В</label>
      <input type="number" v-model.number="modelValue.battery_voltage" step="6">
    </div>
    <div class="input-group">
      <label><i class="fas fa-plug"></i> КПД зарядного, %</label>
      <input type="number" v-model.number="modelValue.charger_efficiency" step="5">
    </div>
    <div class="input-group">
      <label><i class="fas fa-microchip"></i> Потери BMS, %</label>
      <input type="number" v-model.number="modelValue.bms_losses" step="1">
    </div>
    <div class="input-group">
      <label><i class="fas fa-thermometer-half"></i> Температурные потери, %</label>
      <input type="number" v-model.number="modelValue.thermal_losses" step="1">
    </div>
  </SidebarSection>
</template>