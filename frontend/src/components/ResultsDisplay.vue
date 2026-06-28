<script setup lang="ts">
import type { CalculationResult } from '../types/calculator';

defineProps<{
  result: CalculationResult | null;
  loading: boolean;
  voltage: number;
}>();
</script>

<template>
  <div v-if="loading" class="result-card loading">
    <div class="text-center">⏳ Расчет...</div>
  </div>

  <div v-else-if="result" class="results-wrapper">
    <div class="result-card">
      <h3><i class="fas fa-chart-line"></i> Энергозатраты на движение</h3>
      <div class="result-item">
        <span class="result-label"><i class="fas fa-mountain"></i> Подъем:</span>
        <span class="result-value">{{ result.energy.climb_energy_kj }} кДж</span>
      </div>
      <div class="result-item">
        <span class="result-label"><i class="fas fa-tire"></i> Трение качения:</span>
        <span class="result-value">{{ result.energy.rolling_energy_kj }} кДж</span>
      </div>
      <div class="result-item">
        <span class="result-label"><i class="fas fa-wind"></i> Аэродинамика:</span>
        <span class="result-value">{{ result.energy.air_energy_kj }} кДж</span>
      </div>
      <div class="result-item">
        <span class="result-label"><i class="fas fa-rocket"></i> Инерция:</span>
        <span class="result-value">{{ result.energy.inertia_energy_kj }} кДж</span>
      </div>
      <div class="result-item">
        <span class="result-label"><i class="fas fa-rocket"></i> Неучтенные потери:</span>
        <span class="result-value">{{ result.energy.inefficiency_energy_kj }} кДж</span>
      </div>
      <div class="result-item">
        <span class="result-label"><i class="fas fa-rocket"></i> Рекуперация:</span>
        <span class="result-value">{{ result.energy.regen_energy_kj }} кДж</span>
      </div>
      <div class="result-item">
        <span class="result-label"><strong>Всего энергии:</strong></span>
        <span class="result-value">
          <strong>{{ result.energy.total_energy_kj }} кДж / {{ result.energy.total_energy_wh }} Вт·ч</strong>
        </span>
      </div>
    </div>

    <div class="result-card">
      <h3><i class="fas fa-battery-full"></i> Расчет батареи</h3>
      <div class="result-item">
        <span class="result-label"><i class="fas fa-charging-station"></i> КПД зарядки:</span>
        <span class="result-value">{{ result.battery.total_efficiency_percent }}%</span>
      </div>
      <div class="result-item">
        <span class="result-label"><i class="fas fa-database"></i> Энергия с потерями:</span>
        <span class="result-value">{{ result.battery.required_energy_wh }} Вт·ч</span>
      </div>
      <div class="big-result">
        ⚡ {{ result.battery.required_capacity_ah }} А·ч
      </div>
      <div class="result-item">
        <span class="result-label">Рекомендуемая батарея:</span>
        <span class="result-value">{{ voltage }}В {{ result.battery.required_capacity_ah }}А·ч</span>
      </div>
      <div class="note">* С учетом потерь при зарядке (ЗУ, BMS, нагрев)</div>
    </div>
  </div>
</template>
