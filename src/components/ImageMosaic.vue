<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'

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
  document.body.style.overflow = 'hidden'
}
function close() {
  isOpen.value = false
  document.body.style.overflow = ''
}
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
    <transition name="fade">
      <div v-if="isOpen" class="lb" @click.self="close">
        <button class="lb-close" @click="close" aria-label="Close">✕</button>
        <button class="lb-nav prev" @click.stop="prev" aria-label="Previous">‹</button>

        <!-- Media in lightbox -->
        <img
            v-if="isImage(current)"
            class="lb-media"
            :src="current"
            :alt="`photo-${idx+1}`"
        />
        <video
            v-else-if="isVideo(current)"
            class="lb-media"
            :key="idx"
        :src="current"
        controls
        autoplay
        playsinline
        />

        <button class="lb-nav next" @click.stop="next" aria-label="Next">›</button>
        <div class="lb-count">{{ idx + 1 }} / {{ props.images.length }}</div>
      </div>
    </transition>
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

/* Lightbox */
.fade-enter-active, .fade-leave-active { transition: opacity .18s ease }
.fade-enter-from, .fade-leave-to { opacity: 0 }
.lb {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,.86);
  display: flex; align-items: center; justify-content: center;
}
.lb-media {
  max-width: 92vw; max-height: 82vh; border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,.5);
  background: #000; /* tránh viền trắng khi video nhỏ */
}
.lb-close {
  position: absolute; top: 16px; right: 16px;
  background: transparent; color: #fff; border: 1px solid rgba(255,255,255,.25);
  padding: .25rem .5rem; border-radius: 8px; cursor: pointer;
}
.lb-nav {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: rgba(0,0,0,.35); border: 0; color: #fff;
  font-size: 2rem; cursor: pointer; padding: .25rem .6rem; border-radius: 8px;
}
.lb-nav.prev { left: 12px }
.lb-nav.next { right: 12px }
.lb-count {
  position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
  color: #fff; font-size: .95rem; opacity: .9;
}
</style>
