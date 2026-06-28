<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import RouteManager from './components/RouteManager.vue';
import VehicleParams from './components/VehicleParams.vue';
import ResultsDisplay from './components/ResultsDisplay.vue';
import MapContainer from './components/MapContainer.vue';

import { useTheme } from './composables/useTheme';
import { fetchElevationProfile, calculateBattery } from './services/api';
import type { VehicleConfig, CalculationResult } from './types/calculator';
import type { RouteData } from './types/route';

const { currentTheme, initTheme, toggleTheme } = useTheme();

const routeData = ref<RouteData>({ distance_km: 0, total_ascent_m: 0, total_descent_m: 0 });
const hasRoutePoints = computed(() => routeData.value.distance_km > 0);

const vehicleConfig = ref<VehicleConfig>({
  kind: "", name: "", mass_kg: 0, speed_kmh: 0, rolling_resistance_lever_mm: 0, wheel_radius_mm: 0,
  drag_coefficient_cx: 0, frontal_area_m2: 0, inefficiency_percent: 0, regen_efficiency_percent: 0,
  battery_voltage_v: 0, charger_efficiency_percent: 0, bms_losses_percent: 0, thermal_losses_percent: 0
});

const calcResult = ref<CalculationResult | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

const isElevationLoading = ref(false);
const elevationError = ref<string | null>(null);

let elevationController: AbortController | null = null;
const mapResetSignal = ref(false);

onMounted(() => {
  initTheme();
});

async function handleRouteFound(data: { coordinates: any[]; distance: number }) {
  elevationController?.abort();
  elevationController = new AbortController();

  routeData.value.distance_km = data.distance;
  error.value = null;
  isElevationLoading.value = true;
  elevationError.value = null;

  try {
    const { ascent, descent } = await fetchElevationProfile(data.coordinates, elevationController.signal);
    routeData.value.total_ascent_m = ascent;
    routeData.value.total_descent_m = descent;
  } catch (e: any) {
    if (e?.name !== "AbortError") {
      elevationError.value = e?.message ?? "Неизвестная ошибка";
    }
  } finally {
    isElevationLoading.value = false;
  }
}

function handleRoutingError(msg: string) {
  error.value = msg;
}

function triggerReset() {
  elevationController?.abort();
  mapResetSignal.value = true;
}

function onMapResetComplete() {
  mapResetSignal.value = false;
  isElevationLoading.value = false;
  elevationError.value = null;
  error.value = null;

  routeData.value.distance_km = 0;
  routeData.value.total_ascent_m = 0;
  routeData.value.total_descent_m = 0;
  calcResult.value = null;
}

async function handleCalculate() {
  if (routeData.value.distance_km === 0) {
    alert('⚠️ Сначала постройте маршрут! Нажмите Ctrl + клик для выбора точек.');
    return;
  }

  isLoading.value = true;
  try {
    calcResult.value = await calculateBattery({
      ...vehicleConfig.value,
      ...routeData.value
    });
  } catch (e: any) {
    alert(`❌ Ошибка расчета: ${e.message}`);
  } finally {
    isLoading.value = false;
  }
}
</script>
<template>
  <div class="container">
    <div class="sidebar">
      <div class="sidebar-content">
        <div class="header">
          <div class="logo" @click="toggleTheme">
            <i class="fas fa-charging-station"></i>
            <h1>EV Battery<br>Calculator</h1>
          </div>
          <div class="subtitle">Расчет батареи для электротранспорта</div>
        </div>

        <RouteManager v-model="routeData" :has-start="hasRoutePoints" :has-end="hasRoutePoints"
          :isElevationLoading="isElevationLoading" :elevation-error="elevationError || error" @reset="triggerReset" />

        <VehicleParams v-model="vehicleConfig" />

        <button @click="handleCalculate" class="btn-primary" :disabled="isLoading">
          <i class="fas fa-calculator"></i> РАССЧИТАТЬ БАТАРЕЮ
        </button>

        <ResultsDisplay :result="calcResult" :loading="isLoading" :voltage="vehicleConfig.battery_voltage_v" />
      </div>
    </div>

    <MapContainer :theme="currentTheme" :should-reset="mapResetSignal" @update-route="handleRouteFound"
      @routing-error="handleRoutingError" @reset-complete="onMapResetComplete" />
  </div>
</template>