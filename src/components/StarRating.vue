<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  /** v-model: giá trị 1..5 (0 = chưa chọn) */
  modelValue: { type: Number, default: 0 },
  /** Nhãn hiển thị (có thể đưa từ i18n) */
  labels: {
    type: Array,
    default: () => ['Terrible', 'Bad', 'OK', 'Good', 'Excellent']
  },
  /** Kích thước icon sao (px) */
  size: { type: Number, default: 32 },
  /** Chỉ đọc (không cho đổi rating) */
  readonly: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'change'])

/* nội bộ */
const uid = Math.random().toString(36).slice(2, 9)
const value = ref(props.modelValue || 0)
const prev = ref(0)
const hover = ref(0)
/* delay animation cho các sao chớp sáng */
const delays = ref([0, 0, 0, 0, 0])

watch(
    () => props.modelValue,
    v => (value.value = v || 0)
)

const currentLabel = computed(() => {
  const v = hover.value || value.value
  return v ? props.labels[v - 1] : ''
})

function inputId(i) {
  return `${uid}-rating-${i}`
}

function onChange(e) {
  if (props.readonly) return
  prev.value = value.value || 0
  value.value = Number(e.target.value)

  // tính lớp delay cho animation (giống bản gốc)
  const p = prev.value
  const c = value.value
  let d = 0
  delays.value = [0, 0, 0, 0, 0]
  for (let i = 1; i <= 5; i++) {
    if (i > p + 1 && i <= c) {
      d++
      delays.value[i - 1] = d // 1..4 -> map ra rating__label--delayX
    }
  }

  emit('update:modelValue', value.value)
  emit('change', value.value)
}
</script>

<template>
  <form class="rating" :style="{ '--size': size + 'px' }" @change="onChange">
    <div class="rating__stars">
      <!-- radio inputs -->
      <input
          v-for="i in 5"
          :key="'input-'+i"
          class="rating__input"
          :class="'rating__input-' + i"
          type="radio"
          :id="inputId(i)"
          name="rating"
          :value="i"
          :checked="value === i"
          :disabled="readonly"
      />

      <!-- labels + SVG -->
      <label
          v-for="i in 5"
          :key="'label-'+i"
          class="rating__label"
          :class="delays[i-1] ? 'rating__label--delay' + delays[i-1] : ''"
          :for="inputId(i)"
          @mouseenter="!readonly && (hover = i)"
          @mouseleave="hover = 0"
      >
        <svg class="rating__star" :width="size" :height="size" viewBox="0 0 32 32" aria-hidden="true">
          <g transform="translate(16,16)">
            <circle class="rating__star-ring" fill="none" stroke="#000" stroke-width="16" r="8" transform="scale(0)" />
          </g>
          <g stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <g transform="translate(16,16) rotate(180)">
              <polygon class="rating__star-stroke"
                       points="0,15 4.41,6.07 14.27,4.64 7.13,-2.32 8.82,-12.14 0,-7.5 -8.82,-12.14 -7.13,-2.32 -14.27,4.64 -4.41,6.07"
                       fill="none" />
              <polygon class="rating__star-fill"
                       points="0,15 4.41,6.07 14.27,4.64 7.13,-2.32 8.82,-12.14 0,-7.5 -8.82,-12.14 -7.13,-2.32 -14.27,4.64 -4.41,6.07"
                       fill="#000" />
            </g>
            <g transform="translate(16,16)" stroke-dasharray="12 12" stroke-dashoffset="12">
              <polyline class="rating__star-line" transform="rotate(0)" points="0 4,0 16" />
              <polyline class="rating__star-line" transform="rotate(72)" points="0 4,0 16" />
              <polyline class="rating__star-line" transform="rotate(144)" points="0 4,0 16" />
              <polyline class="rating__star-line" transform="rotate(216)" points="0 4,0 16" />
              <polyline class="rating__star-line" transform="rotate(288)" points="0 4,0 16" />
            </g>
          </g>
        </svg>
        <span class="rating__sr">{{ i }} star</span>
      </label>

      <!-- hiển thị text của rating/hover -->
<!--      <p class="rating__display" aria-live="polite">-->
<!--        {{ currentLabel }}-->
<!--      </p>-->
    </div>
  </form>
</template>

<style scoped>
/* Tất cả CSS của bạn, mình “scope” vào .rating để không ảnh hưởng global */
.rating { --bg: transparent; --fg: #e2e8f0; --primary: #255ff4; --yellow: #f4a825; --yellow-t: rgba(244,168,37,0); --bezier: cubic-bezier(0.42,0,0.58,1); --trans-dur: .3s; }
.rating__display {
  font-size: .95em; font-weight: 500; min-height: 1.25em;
  position: absolute; top: 100%; width: 100%; text-align: center; color: var(--fg);
}
.rating__stars { display: flex; padding-bottom: .375em; position: relative; }
.rating__star { display: block; overflow: visible; pointer-events: none; width: var(--size); height: var(--size); }
.rating__star-ring, .rating__star-fill, .rating__star-line, .rating__star-stroke {
  animation-duration: 1s; animation-timing-function: ease-in-out; animation-fill-mode: forwards;
}
.rating__star-ring, .rating__star-fill, .rating__star-line { stroke: var(--yellow); }
.rating__star-fill { fill: var(--yellow); transform: scale(0); transition: fill var(--trans-dur) var(--bezier), transform var(--trans-dur) var(--bezier); }
.rating__star-line { stroke-dasharray: 12 13; stroke-dashoffset: -13; }
.rating__star-stroke { stroke: #454954; transition: stroke var(--trans-dur); }
.rating__label { cursor: pointer; padding: .125em; }
.rating__label--delay1 .rating__star-ring, .rating__label--delay1 .rating__star-fill, .rating__label--delay1 .rating__star-line, .rating__label--delay1 .rating__star-stroke { animation-delay: .05s; }
.rating__label--delay2 .rating__star-ring, .rating__label--delay2 .rating__star-fill, .rating__label--delay2 .rating__star-line, .rating__label--delay2 .rating__star-stroke { animation-delay: .1s; }
.rating__label--delay3 .rating__star-ring, .rating__label--delay3 .rating__star-fill, .rating__label--delay3 .rating__star-line, .rating__label--delay3 .rating__star-stroke { animation-delay: .15s; }
.rating__label--delay4 .rating__star-ring, .rating__label--delay4 .rating__star-fill, .rating__label--delay4 .rating__star-line, .rating__label--delay4 .rating__star-stroke { animation-delay: .2s; }

.rating__input { position: absolute; appearance: none; -webkit-appearance: none; }
.rating__input:hover ~ .rating__label .rating__star-stroke { stroke: var(--yellow); transform: scale(1); }

/* checked: chạy animation */
.rating__input-1:checked ~ .rating__label:first-of-type .rating__star-ring,
.rating__input-2:checked ~ .rating__label:nth-of-type(-n + 2) .rating__star-ring,
.rating__input-3:checked ~ .rating__label:nth-of-type(-n + 3) .rating__star-ring,
.rating__input-4:checked ~ .rating__label:nth-of-type(-n + 4) .rating__star-ring,
.rating__input-5:checked ~ .rating__label:nth-of-type(-n + 5) .rating__star-ring { animation-name: starRing; }

.rating__input-1:checked ~ .rating__label:first-of-type .rating__star-stroke,
.rating__input-2:checked ~ .rating__label:nth-of-type(-n + 2) .rating__star-stroke,
.rating__input-3:checked ~ .rating__label:nth-of-type(-n + 3) .rating__star-stroke,
.rating__input-4:checked ~ .rating__label:nth-of-type(-n + 4) .rating__star-stroke,
.rating__input-5:checked ~ .rating__label:nth-of-type(-n + 5) .rating__star-stroke { animation-name: starStroke; }

.rating__input-1:checked ~ .rating__label:first-of-type .rating__star-line,
.rating__input-2:checked ~ .rating__label:nth-of-type(-n + 2) .rating__star-line,
.rating__input-3:checked ~ .rating__label:nth-of-type(-n + 3) .rating__star-line,
.rating__input-4:checked ~ .rating__label:nth-of-type(-n + 4) .rating__star-line,
.rating__input-5:checked ~ .rating__label:nth-of-type(-n + 5) .rating__star-line { animation-name: starLine; }

.rating__input-1:checked ~ .rating__label:first-of-type .rating__star-fill,
.rating__input-2:checked ~ .rating__label:nth-of-type(-n + 2) .rating__star-fill,
.rating__input-3:checked ~ .rating__label:nth-of-type(-n + 3) .rating__star-fill,
.rating__input-4:checked ~ .rating__label:nth-of-type(-n + 4) .rating__star-fill,
.rating__input-5:checked ~ .rating__label:nth-of-type(-n + 5) .rating__star-fill { animation-name: starFill; }

.rating__sr { clip: rect(1px, 1px, 1px, 1px); overflow: hidden; position: absolute; width:1px; height:1px; }

/* keyframes (giữ nguyên như bản gốc) */
@keyframes starRing {
  from, 20% { animation-timing-function: ease-in; opacity:1; r:8px; stroke-width:16px; transform:scale(0) }
  35% { animation-timing-function: ease-out; opacity:.5; r:8px; stroke-width:16px; transform:scale(1) }
  50%, to { opacity:0; r:16px; stroke-width:0; transform:scale(1) }
}
@keyframes starFill {
  from, 40% { animation-timing-function: ease-out; transform:scale(0) }
  60% { animation-timing-function: ease-in-out; transform:scale(1.2) }
  80% { transform:scale(.9) }
  to { transform:scale(1) }
}
@keyframes starStroke {
  from { transform:scale(1) }
  20%, to { transform:scale(0) }
}
@keyframes starLine {
  from, 40% { animation-timing-function:ease-out; stroke-dasharray:1 23; stroke-dashoffset:1 }
  60%, to { stroke-dasharray:12 13; stroke-dashoffset:-13 }
}
</style>
