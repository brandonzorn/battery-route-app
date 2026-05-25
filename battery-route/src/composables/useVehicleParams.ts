import { onBeforeUnmount, onMounted, ref } from "vue";
import type { VehicleConfig } from "../types/calculator";
import { fetchVehicles } from "../services/api";

export function useVehicleParams() {
const vehicles = ref<VehicleConfig[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

let controller: AbortController | null = null;

async function getVehicles() {
  controller?.abort();
  controller = new AbortController();

  try {
      isLoading.value = true;
      error.value = null;

      vehicles.value = await fetchVehicles(controller.signal);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
          error.value = e?.message ?? "Неизвестная ошибка";
          console.error("Ошибка API vehicles:", e);
      }
    } finally {
      isLoading.value = false;
    }
}

function stop() {
    controller?.abort();
}

onMounted(getVehicles);
onBeforeUnmount(stop);

return {
    vehicles,
    isLoading,
    error,
}
}