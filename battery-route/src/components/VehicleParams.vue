<script setup lang="ts">
import SidebarSection from './SidebarSection.vue';
import type { VehicleConfig } from '../types/calculator';
import { useVehicleParams } from '../composables/useVehicleParams';

const modelValue = defineModel<VehicleConfig>({ required: true });

const { vehicles, isLoading, error } = useVehicleParams();

function getVehicleIcon(kind: string): string {
  switch (kind) {
    case 'bike': return 'fas fa-bicycle';
    case 'car': return 'fas fa-car';
    case 'scooter': return 'fas fa-motorcycle';
    default: return 'fas fa-transportation';
  }
}

function selectPreset(index: number) {
  modelValue.value = {
    ...modelValue.value,
    ...vehicles.value[index]
  };
}
</script>

<template>
  <SidebarSection title="Транспортное средство" icon="fas fa-motorcycle">
    <div v-if="vehicles" class="preset-buttons">
      <button v-for="(vehicle, index) in vehicles" :key="index" class="preset-btn" @click="selectPreset(index)"
        type="button">
        <i :class="getVehicleIcon(vehicle.kind)"></i> {{ vehicle.name }}
      </button>
    </div>

    <div v-if="isLoading" class="result-card loading">
      <div class="text-center">⏳ Получение ...</div>
    </div>

    <div v-if="error" class="result-card error">
      <div class="text-center">❌ Ошибка: {{ error }}</div>
    </div>

    <div class="input-group">
      <label><i class="fas fa-weight-hanging"></i> Масса с водителем, кг</label>
      <input type="number" v-model.number="modelValue.mass_kg" step="10">
    </div>
    <div class="input-group">
      <label><i class="fas fa-tachometer-alt"></i> Скорость, км/ч</label>
      <input type="number" v-model.number="modelValue.speed_kmh" step="5">
    </div>
    <div class="input-group">
      <label><i class="fas fa-tire"></i> Трение качения, мм</label>
      <input type="number" v-model.number="modelValue.rolling_resistance_crr" step="0.5">
    </div>
    <div class="input-group">
      <label><i class="fas fa-circle"></i> Радиус колеса, мм</label>
      <input type="number" v-model.number="modelValue.wheel_radius_mm" step="10">
    </div>
    <div class="input-group">
      <label><i class="fas fa-wind"></i> Cx (аэродинамика)</label>
      <input type="number" v-model.number="modelValue.drag_coefficient_cx" step="0.05">
    </div>
    <div class="input-group">
      <label><i class="fas fa-arrows-alt"></i> Площадь миделя, м²</label>
      <input type="number" v-model.number="modelValue.frontal_area_m2" step="0.05">
    </div>
    <div class="input-group">
      <label><i class="fas fa-percent"></i> Неучтенные потери, %</label>
      <input type="number" v-model.number="modelValue.inefficiency_percent" step="5">
    </div>
  </SidebarSection>

  <SidebarSection title="Рекуперация" icon="fas fa-bolt">
    <div class="input-group">
      <label><i class="fas fa-sync-alt"></i> Эффективность, %</label>
      <input type="number" v-model.number="modelValue.regen_efficiency_percent" step="5">
    </div>
  </SidebarSection>

  <SidebarSection title="Аккумулятор и зарядка" icon="fas fa-battery-full">
    <div class="input-group">
      <label><i class="fas fa-charging-station"></i> Напряжение АКБ, В</label>
      <input type="number" v-model.number="modelValue.battery_voltage_v" step="6">
    </div>
    <div class="input-group">
      <label><i class="fas fa-plug"></i> КПД зарядного, %</label>
      <input type="number" v-model.number="modelValue.charger_efficiency_percent" step="5">
    </div>
    <div class="input-group">
      <label><i class="fas fa-microchip"></i> Потери BMS, %</label>
      <input type="number" v-model.number="modelValue.bms_losses_percent" step="1">
    </div>
    <div class="input-group">
      <label><i class="fas fa-thermometer-half"></i> Температурные потери, %</label>
      <input type="number" v-model.number="modelValue.thermal_losses_percent" step="1">
    </div>
  </SidebarSection>
</template>