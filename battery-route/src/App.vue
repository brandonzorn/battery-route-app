<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';

import RouteManager from './components/RouteManager.vue';
import VehicleParams from './components/VehicleParams.vue';
import ResultsDisplay from './components/ResultsDisplay.vue';

import { apiService } from './services/api';
import type { VehicleConfig, RouteData, CalculationResult } from './types/calculator';

const mapRef = ref<HTMLDivElement | null>(null);
let mapInstance: L.Map | null = null;
let routingControl: any = null;

const startPoint = ref<L.LatLng | null>(null);
const endPoint = ref<L.LatLng | null>(null);
let startMarker: L.Marker | null = null;
let endMarker = null as L.Marker | null;

const routeData = reactive<RouteData>({ distance: 0, delta_h: 0, total_descent: 0 });
const vehicleConfig = ref<VehicleConfig>({
  mass: 100, speed: 25, rolling_resistance: 2, wheel_radius: 350,
  drag_coefficient: 1.0, frontal_area: 0.4, inefficiency: 10, regen_efficiency: 10,
  battery_voltage: 48, charger_efficiency: 85, bms_losses: 5, thermal_losses: 5
});

const calcResult = ref<CalculationResult | null>(null);
const isLoading = ref(false);

onMounted(() => {
  if (!mapRef.value) return;

  mapInstance = L.map(mapRef.value).setView([55.75, 37.62], 12);
  mapInstance.invalidateSize();
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap | EV Battery Calculator',
    maxZoom: 19
  }).addTo(mapInstance);

  mapInstance.on('click', onMapClick);

});

const onMapClick = (e: L.LeafletMouseEvent) => {
  const isCtrlPressed = e.originalEvent.ctrlKey || e.originalEvent.metaKey;
  
  if (!isCtrlPressed) {
    showTempPopup(e.latlng, '💡 Для установки точки нажмите <strong>Ctrl + клик</strong>');
    return;
  }
  
  if (!startPoint.value) {
    setStartPoint(e.latlng);
  } else if (!endPoint.value) {
    setEndPoint(e.latlng);
  } else {
    showTempPopup(e.latlng, '⚠️ Маршрут уже построен! Нажмите "Сбросить"');
  }
};

const setStartPoint = (latlng: L.LatLng) => {
  if (!mapInstance) return;
  startPoint.value = latlng;
  startMarker = L.marker(latlng, {
    icon: L.divIcon({
      className: 'custom-div-icon',
      html: '<div style="background-color:#10b981; width:14px; height:14px; border-radius:50%; border:2px solid white; box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [18, 18]
    })
  }).addTo(mapInstance);
};

const setEndPoint = (latlng: L.LatLng) => {
  if (!mapInstance || !startPoint.value) return;
  endPoint.value = latlng;
  endMarker = L.marker(latlng, {
    icon: L.divIcon({
      className: 'custom-div-icon',
      html: '<div style="background-color:#ef4444; width:14px; height:14px; border-radius:50%; border:2px solid white; box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [18, 18]
    })
  }).addTo(mapInstance);

  buildRoute();
};

const buildRoute = () => {
  if (!mapInstance || !startPoint.value || !endPoint.value) return;

  routingControl = L.Routing.control({
    waypoints: [startPoint.value, endPoint.value],
    show: false,
    router: (L.Routing as any).osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' })
  }).addTo(mapInstance);

  routingControl.on('routesfound', async (e: any) => {
    const route = e.routes[0];
    routeData.distance = parseFloat((route.summary.totalDistance / 1000).toFixed(1));
    
    try {
      const { ascent, descent } = await apiService.fetchElevationProfile(route.coordinates);
      routeData.delta_h = ascent;
      routeData.total_descent = descent;
    } catch (err) {
      console.error('Ошибка API высот:', err);
    }
  });
};

const resetRoute = () => {
  if (!mapInstance) return;
  if (routingControl) mapInstance.removeControl(routingControl);
  if (startMarker) mapInstance.removeLayer(startMarker);
  if (endMarker) mapInstance.removeLayer(endMarker);

  startPoint.value = null;
  endPoint.value = null;
  routeData.distance = 0;
  routeData.delta_h = 0;
  routeData.total_descent = 0;
  calcResult.value = null;
};

const handleCalculate = async () => {
  if (routeData.distance === 0) {
    alert('⚠️ Сначала постройте маршрут! Нажмите Ctrl + клик для выбора точек.');
    return;
  }

  isLoading.value = true;
  try {
    calcResult.value = await apiService.calculateBattery({
      ...vehicleConfig.value,
      ...routeData
    });
  } catch (e: any) {
    alert(`❌ Ошибка расчета: ${e.message}`);
  } finally {
    isLoading.value = false;
  }
};

const showTempPopup = (latlng: L.LatLng, msg: string) => {
  if (!mapInstance) return;
  const popup = L.popup().setLatLng(latlng).setContent(msg).openOn(mapInstance);
  setTimeout(() => mapInstance?.closePopup(popup), 2000);
};
</script>

<template>
  <div class="container">
    <div class="sidebar">
      <div class="sidebar-content">
        <div class="header">
          <div class="logo">
            <i class="fas fa-charging-station"></i>
            <h1>EV Battery<br>Calculator</h1>
          </div>
          <div class="subtitle">Расчет батареи для электротранспорта</div>
        </div>

        <RouteManager 
          :route="routeData" 
          :has-start="!!startPoint"
          :has-end="!!endPoint"
          @reset="resetRoute" 
        />

        <VehicleParams v-model="vehicleConfig" />

        <button @click="handleCalculate" class="btn-primary" :disabled="isLoading">
          <i class="fas fa-calculator"></i> РАССЧИТАТЬ БАТАРЕЮ
        </button>

        <ResultsDisplay 
          :result="calcResult" 
          :loading="isLoading" 
          :voltage="vehicleConfig.battery_voltage" 
        />
        
        <div style="height: 20px;"></div>
      </div>
    </div>

    <div class="map-container">
      <div id="map" ref="mapRef"></div>
    </div>
  </div>
</template>

