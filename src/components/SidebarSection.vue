<script setup lang="ts">
defineProps<{
  title: string;
  icon: string;
}>();
</script>

<template>
  <div class="section">
    <div class="section-title">
      <i :class="icon"></i>
      <span>{{ title }}</span>
    </div>
    <slot />
  </div>
</template>
