<template>
  <div class="section-header">
    <h2 class="section-title">{{ title }}</h2>
    <p class="section-subtitle" v-if="subtitle">{{ subtitle }}</p>
    <slot />
  </div>
</template>

<style scoped>
.section-header {
  margin-bottom: 2rem;
}
.section-subtitle {
  color: var(--muted);
  font-size: 1.1rem;
  max-width: 600px;
}
</style>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>
