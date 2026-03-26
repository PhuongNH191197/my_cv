<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  images: { type: Array, default: () => [] }, // mảng URL (ảnh hoặc video)
  max: { type: Number, default: 4 }
})

const visible = computed(() => props.images.slice(0, props.max))

const isVideo = (src = '') => /\.(mp4|webm|ogg)(\?.*)?$/i.test(src)
const isImage = (src = '') => /\.(png|jpe?g|webp|gif|bmp|svg)(\?.*)?$/i.test(src)

const isOpen = ref(false)
const idx = ref(0)
const current = computed(() => props.images[idx.value])

function open(i = 0) {
  if (!props.images.length) return
  idx.value = i
  isOpen.value = true
}
function close() {
  isOpen.value = false
}

watch(isOpen, (val) => {
  if (val) document.body.style.overflow = 'hidden'
  else document.body.style.overflow = ''
})
function next() {
  if (!props.images.length) return
  idx.value = (idx.value + 1) % props.images.length
}
function prev() {
  if (!props.images.length) return
  idx.value = (idx.value - 1 + props.images.length) % props.images.length
}
function onKey(e) {
  if (!isOpen.value) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowRight') next()
  if (e.key === 'ArrowLeft') prev()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="mosaic" v-if="visible.length">
    <div class="grid">
      <div
          v-for="(src, i) in visible"
          :key="i"
          class="tile"
          :class="{ primary: i === 0, dim: i === visible.length - 1 && props.images.length > props.max }"
          @click="open(i)"
      >
        <!-- Thumbnail: image or video -->
        <img v-if="isImage(src)" :src="src" :alt="`image-${i+1}`" />
        <video
            v-else-if="isVideo(src)"
            :src="src"
            muted
            loop
            autoplay
            playsinline
            preload="metadata"
        ></video>

        <div class="more" v-if="i === visible.length - 1 && props.images.length > props.max">
          +{{ props.images.length - props.max }}
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <transition name="lb-fade">
        <div v-if="isOpen" class="lb" @click.self="close">
          <button class="lb-close" @click="close" aria-label="Close">✕</button>
          
          <button class="lb-nav prev" @click.stop="prev" aria-label="Previous">‹</button>

          <div class="lb-content">
            <transition name="lb-slide" mode="out-in">
              <div :key="idx" class="lb-media-frame">
                <img
                    v-if="isImage(current)"
                    class="lb-media"
                    :src="current"
                    :alt="`photo-${idx+1}`"
                />
                <video
                    v-else-if="isVideo(current)"
                    class="lb-media"
                    :src="current"
                    controls
                    autoplay
                    playsinline
                />
              </div>
            </transition>
          </div>

          <button class="lb-nav next" @click.stop="next" aria-label="Next">›</button>
          
          <div class="lb-count">{{ idx + 1 }} / {{ props.images.length }}</div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<style scoped>
.mosaic { width: 100% }

/* Mosaic grid */
.grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-auto-rows: 140px;
  gap: 10px;
}
.tile { position: relative; cursor: pointer; overflow: hidden; border-radius: 10px }
.tile.primary { grid-row: span 2 }
.tile img,
.tile video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.more {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,.55); color: #fff; font-weight: 700; font-size: 1.5rem;
}
.dim::after { content: ""; position: absolute; inset: 0; background: rgba(0,0,0,.25) }

@media (max-width: 767px) {
  .grid {
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: 120px;
  }
  .tile.primary { grid-column: span 2 }
}

/* Lightbox Transitions */
.lb-fade-enter-active, .lb-fade-leave-active {
  transition: opacity 0.25s ease;
}
.lb-fade-enter-from, .lb-fade-leave-to {
  opacity: 0;
}

.lb-slide-enter-active, .lb-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.lb-slide-enter-from {
  opacity: 0;
  transform: scale(0.96) translateY(5px);
}
.lb-slide-leave-to {
  opacity: 0;
  transform: scale(1.04) translateY(-5px);
}

.lb {
  position: fixed; inset: 0; z-index: 999999;
  background: rgba(0,0,0,0.95);
  backdrop-filter: blur(15px);
  display: flex; align-items: center; justify-content: center;
}
.lb-content {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  padding: 40px;
}
.lb-media-frame {
  width: auto; height: auto;
  max-width: 90vw; max-height: 80vh;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 40px 100px rgba(0,0,0,0.8);
  will-change: transform, opacity;
}
.lb-media {
  max-width: 100%; max-height: 100%;
  object-fit: contain;
  display: block;
}
.lb-close {
  position: absolute; top: env(safe-area-inset-top, 20px); right: 20px; z-index: 10100;
  background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2);
  width: 44px; height: 44px; border-radius: 50%; cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
  transition: all 0.2s ease;
}
.lb-close:hover { background: rgba(255,255,255,0.2); }

.lb-nav {
  position: absolute; top: 50%; transform: translateY(-50%); z-index: 10100;
  background: rgba(255,255,255,0.05); border: 0;
  color: #fff; width: 50px; height: 50px; border-radius: 50%;
  font-size: 2.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s ease;
}
.lb-nav:hover { background: rgba(255,255,255,0.15); }
.lb-nav.prev { left: 10px }
.lb-nav.next { right: 10px }

.lb-count {
  position: absolute; bottom: env(safe-area-inset-bottom, 20px); left: 50%; transform: translateX(-50%);
  color: #fff; font-size: 0.9rem; font-weight: 500;
  background: rgba(0,0,0,0.4); padding: 5px 15px; border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.1);
}

@media (max-width: 640px) {
  .lb-media-frame { max-width: 100vw; max-height: 85vh; border-radius: 0; border: 0; background: transparent; }
  .lb-media { max-width: 100vw; max-height: 85vh; }
  .lb-nav { width: 40px; height: 40px; font-size: 1.8rem; background: rgba(0,0,0,0.2); }
  .lb-close { top: 15px; right: 15px; width: 40px; height: 40px; }
  .lb-content { padding: 5px; }
}
</style>
