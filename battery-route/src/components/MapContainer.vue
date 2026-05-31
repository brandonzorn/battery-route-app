<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const props = defineProps<{
  theme: 'light' | 'dark';
  shouldReset: boolean;
}>();

const emit = defineEmits<{
  (e: 'update-route', data: { coordinates: L.LatLng[]; distance: number }): void;
  (e: 'routing-error', message: string): void;
  (e: 'reset-complete'): void;
}>();

const mapRef = ref<HTMLDivElement | null>(null);
let mapInstance: L.Map | null = null;
let tileLayerInstance: L.TileLayer | null = null;
let routingControl: L.Routing.Control | null = null;

const startPoint = ref<L.LatLng | null>(null);
const endPoint = ref<L.LatLng | null>(null);
let startMarker: L.Marker | null = null;
let endMarker: L.Marker | null = null;
let resizeObserver: ResizeObserver | null = null;

const MAP_TILES = {
  light: "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
  dark: "https://c.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png"
};

onMounted(() => {
  if (!mapRef.value) return;

  mapInstance = L.map(mapRef.value).setView([55.75, 37.62], 12);
  updateTiles(props.theme);

  mapInstance.on("click", onMapClick);

  resizeObserver = new ResizeObserver(() => {
    if (mapInstance) mapInstance.invalidateSize();
  });
  resizeObserver.observe(mapRef.value);
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  if (mapInstance) {
    mapInstance.off('click', onMapClick);
    if (routingControl) mapInstance.removeControl(routingControl);
    mapInstance.remove();
  }
});

watch(() => props.theme, (newTheme) => {
  updateTiles(newTheme);
});

watch(() => props.shouldReset, (newValue) => {
  if (newValue) clearMap();
});

function updateTiles(theme: 'light' | 'dark') {
  if (!mapInstance) return;
  if (tileLayerInstance) mapInstance.removeLayer(tileLayerInstance);

  tileLayerInstance = L.tileLayer(MAP_TILES[theme], {
    attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
    className: 'map-tiles',
    maxZoom: 19,
  }).addTo(mapInstance);
}

function onMapClick(e: L.LeafletMouseEvent) {
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
}

function setStartPoint(latlng: L.LatLng) {
  if (!mapInstance) return;
  startPoint.value = latlng;
  startMarker = L.marker(latlng, {
    icon: L.divIcon({
      className: 'custom-div-icon',
      html: '<div style="background-color:#10b981; width:14px; height:14px; border-radius:50%; border:2px solid white; box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [18, 18]
    })
  }).addTo(mapInstance);
}

function setEndPoint(latlng: L.LatLng) {
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
}

function buildRoute() {
  if (!mapInstance || !startPoint.value || !endPoint.value) return;
  if (routingControl) mapInstance.removeControl(routingControl);

  const plan = L.Routing.plan([startPoint.value, endPoint.value], {
    createMarker: () => false,
    addWaypoints: false,
    draggableWaypoints: false
  });

  routingControl = L.Routing.control({
    routeWhileDragging: false,
    show: false,
    showAlternatives: false,
    plan,
    lineOptions: {
      styles: [{ color: "#3388ff", opacity: 0.8, weight: 6 }],
      addWaypoints: false
    } as any,
    router: (L.Routing).osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' })
  }).addTo(mapInstance);

  routingControl.on('routesfound', (event: any) => {
    const route: L.Routing.IRoute = event.routes[0];
    if (!route.summary || !route.coordinates) {
      emit('routing-error', "Маршрутные данные отсутствуют");
      return;
    }
    const distance = parseFloat((route.summary.totalDistance / 1000).toFixed(1));
    emit('update-route', { coordinates: route.coordinates, distance });
  });

  routingControl.on('routingerror', (err: any) => {
    emit('routing-error', err?.error?.message ?? "Ошибка построения маршрута");
  });
}

function clearMap() {
  if (!mapInstance) return;
  if (routingControl) { mapInstance.removeControl(routingControl); routingControl = null; }
  if (startMarker) { mapInstance.removeLayer(startMarker); startMarker = null; }
  if (endMarker) { mapInstance.removeLayer(endMarker); endMarker = null; }

  startPoint.value = null;
  endPoint.value = null;
  emit('reset-complete');
}

function showTempPopup(latlng: L.LatLng, msg: string) {
  if (!mapInstance) return;
  const popup = L.popup().setLatLng(latlng).setContent(msg).openOn(mapInstance);
  setTimeout(() => mapInstance?.closePopup(popup), 2000);
}
</script>
<template>
  <div class="map-container">
    <div id="map" ref="mapRef"></div>
  </div>
</template>