<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/i18n' // dùng helper cũ để load messages

const { locale } = useI18n()

const open = ref(false)
const changing = ref(false)
const root = ref(null)

const choices = [
  { code: 'en', label: 'English', flag: 'gb' },
  { code: 'vi', label: 'Tiếng Việt', flag: 'vn' },
]

const current = computed(
    () => choices.find(c => c.code === String(locale.value)) || choices[0]
)

async function pick(code) {
  if (code === locale.value || changing.value) { open.value = false; return }
  changing.value = true
  try {
    // Quan trọng: dùng setLocale để nạp messages + set html[lang] + lưu localStorage
    await setLocale(code)
  } finally {
    changing.value = false
    open.value = false
  }
}

function toggle(){ open.value = !open.value }
function onDocClick(e){ if (!root.value?.contains(e.target)) open.value = false }
onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <div class="lang-wrap" ref="root">
    <button class="lang-btn" @click="toggle" :aria-expanded="open" aria-haspopup="menu" :title="current.label">
      <span class="flag">
        <!-- VN -->
        <svg v-if="current.flag==='vn'" viewBox="0 0 900 600">
          <rect width="900" height="600" fill="#DA251D"/>
          <polygon fill="#FF0" points="450,120 545.16,412.87 296.09,231.91 603.91,231.91 354.84,412.87"/>
        </svg>
        <!-- UK (Union Jack giản lược) -->
        <svg v-else viewBox="0 0 60 36">
          <rect width="60" height="36" fill="#012169"/>
          <path d="M0,0 60,36 M60,0 0,36" stroke="#fff" stroke-width="7"/>
          <path d="M0,0 60,36 M60,0 0,36" stroke="#C8102E" stroke-width="3.5"/>
          <rect x="25" width="10" height="36" fill="#fff"/>
          <rect y="13" width="60" height="10" fill="#fff"/>
          <rect x="27" width="6" height="36" fill="#C8102E"/>
          <rect y="15" width="60" height="6" fill="#C8102E"/>
        </svg>
      </span>
      <i class="fa-solid fa-chevron-down chevron"></i>
    </button>

    <transition name="fade">
      <div v-if="open" class="dropdown" role="menu">
        <button class="item" @click="pick('vi')" :disabled="changing">
          <span class="flag sm">
            <svg viewBox="0 0 900 600">
              <rect width="900" height="600" fill="#DA251D"/>
              <polygon fill="#FF0" points="450,120 545.16,412.87 296.09,231.91 603.91,231.91 354.84,412.87"/>
            </svg>
          </span>
          <span>Tiếng Việt</span>
          <i v-if="locale==='vi'" class="fa-solid fa-check tick"></i>
        </button>
        <button class="item" @click="pick('en')" :disabled="changing">
          <span class="flag sm">
            <svg viewBox="0 0 60 36">
              <rect width="60" height="36" fill="#012169"/>
              <path d="M0,0 60,36 M60,0 0,36" stroke="#fff" stroke-width="7"/>
              <path d="M0,0 60,36 M60,0 0,36" stroke="#C8102E" stroke-width="3.5"/>
              <rect x="25" width="10" height="36" fill="#fff"/>
              <rect y="13" width="60" height="10" fill="#fff"/>
              <rect x="27" width="6" height="36" fill="#C8102E"/>
              <rect y="15" width="60" height="6" fill="#C8102E"/>
            </svg>
          </span>
          <span>English</span>
          <i v-if="locale==='en'" class="fa-solid fa-check tick"></i>
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.lang-wrap{ position: relative; display:inline-block }
.lang-btn{
  display:inline-flex; align-items:center; justify-content: center; gap:.5rem;
  background: rgba(255,255,255,0.06); color:#e5e7eb;
  border:1px solid var(--glass-border);
  border-radius: var(--radius-md); 
  height: 42px; min-width: 100px; padding: 0 1rem;
  cursor:pointer;
  transition: var(--transition-smooth);
}
.lang-btn:hover{ border-color: var(--primary); background:rgba(255,255,255,.1) }
.chevron{ font-size:.7rem; opacity:.7; margin-left: 2px; }

.flag{ width:24px; height:16px; border-radius:3px; overflow:hidden; display:inline-flex; flex-shrink:0; align-items: center; justify-content: center; }
.flag svg{ width:100%; height:100%; display:block; object-fit:cover }
.flag.sm{ width:22px; height:14px }

.dropdown{
  position:absolute; right:0; top:calc(100% + 8px);
  min-width: 180px; z-index: 60;
  background:#0b1020; color:#e5e7eb;
  border:1px solid rgba(255,255,255,.1); border-radius:12px;
  box-shadow:0 20px 50px rgba(0,0,0,.6); padding:.35rem;
}
.item{
  width:100%; display:flex; align-items:center; gap:.6rem;
  padding:.45rem .55rem; border-radius:8px; background:transparent;
  border:0; color:inherit; text-align:left; cursor:pointer;
}
.item:hover{ background:rgba(255,255,255,.06) }
.tick{ margin-left:auto; color:#22d3ee }

.fade-enter-active, .fade-leave-active{ transition: opacity .12s ease, transform .12s ease }
.fade-enter-from, .fade-leave-to{ opacity:0; transform: translateY(-6px) }
</style>
