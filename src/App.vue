<script setup>
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import AIAssistant from '@/components/AIAssistant.vue'
import { onMounted } from 'vue'
import { useUiStore } from '@/stores/ui.store'

onMounted(() => {
  const ui = useUiStore()
  ui.initTheme()
})
</script>

<template>
  <Navbar />
  <main class="main-content">
    <router-view v-slot="{ Component }">
      <transition name="fade-slide" mode="out-in">
        <component :is="Component" :key="$route.path" />
      </transition>
    </router-view>
  </main>
  <AIAssistant />
  <Footer />
</template>

<style>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

.main-content {
  min-height: calc(100vh - 160px);
}
</style>
