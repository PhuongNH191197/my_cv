<script setup>
import { computed, onMounted, onBeforeUnmount, ref, nextTick } from 'vue'
import SectionTitle from '@/components/SectionTitle.vue'
import { useResumeStore } from '@/stores/resume.store'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const store = useResumeStore()
let io // IntersectionObserver

onMounted(async () => {
  if (!store.resume?.profile) await store.load()
  await nextTick()
  setupReveal()
})
onBeforeUnmount(() => io?.disconnect())

/** ==== DATA ==== **/
const skillsDetailed = computed(() => {
  const det = store.resume?.skillsDetailed || []
  if (det.length) return det
  // Fallback từ mảng string -> level = 3, group = "Other"
  const arr = store.resume?.skills || []
  return arr.map(n => ({ name: n, level: 3, group: 'Other' }))
})

const groups = computed(() => {
  const set = new Set(['All'])
  skillsDetailed.value.forEach(s => s.group && set.add(s.group))
  return Array.from(set)
})
const selected = ref('All')
const q = ref('') // search

const filtered = computed(() => {
  let list = skillsDetailed.value
  if (selected.value !== 'All') list = list.filter(s => s.group === selected.value)
  if (q.value.trim()) {
    const k = q.value.toLowerCase()
    list = list.filter(s => s.name.toLowerCase().includes(k))
  }
  // sắp xếp: level ↓, tên ↑
  return [...list].sort((a, b) => (b.level || 0) - (a.level || 0) || a.name.localeCompare(b.name))
})

// Featured: top 6 kỹ năng level cao nhất
const featured = computed(() => filtered.value.slice(0, 6))

/** ==== HELPERS ==== **/
function levelPct(lv) {
  const n = Number(lv) || 0
  return Math.min(100, Math.max(0, (n / 5) * 100))
}
const deviconMap = {
  // đã có
  'vue 3': 'vuejs', vue: 'vuejs',
  'spring boot': 'spring', spring: 'spring',
  java: 'java',
  postgresql: 'postgresql',
  docker: 'docker',
  rabbitmq: 'rabbitmq',
  typescript: 'typescript',
  'type script': 'typescript',
  javascript: 'javascript',
  '.net': 'dotnet', 'dotnet': 'dotnet',
  vite: 'vite',                 // nếu fail, bạn để logo local /logos/vite.svg
  axios: null,                  // dùng logo local
  hibernate: 'hibernate',
  pinia: null,                  // dùng logo local

  // ---- mới thêm ----
  angular: 'angularjs',         // Devicon dùng angularjs cho Angular (modern vẫn dùng icon này)
  react: 'react',

  oracle: 'oracle',
  clickhouse: null,             // chưa có devicon -> nên đặt /public/logos/clickhouse.svg
  'sql server': 'microsoftsqlserver',
  mssql: 'microsoftsqlserver',
  mysql: 'mysql',
  mariadb: 'mariadb',

  kafka: 'apachekafka',
  'apache kafka': 'apachekafka',

  grafana: 'grafana',
  prometheus: 'prometheus',

  elasticsearch: 'elasticsearch',
  logstash: 'logstash',
  kibana: 'kibana',

  graphql: 'graphql',
  grpc: null,
  soap: null,
  websocket: null, // dùng local
  sse: null,
  webrtc: null,

  rtmp: null,
  srt: null,
  hls: null,
  'mpeg-dash': null,

  amqp: null,
  mqtt: 'mqtt',
  stomp: null,

  json: null,
  xml: null,
  avro: null,
  protobuf: null,

  tls: null,
  mtls: null,

  keycloak: null,
  oauth2: null,
  'openid connect': null,
  saml: null,
  jwt: null,

  ldap: null,
  'active directory': null
}

function slug(s = '') {
  return s.toLowerCase()
      .replace(/\+/g, 'plus')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
}
function localLogo(name) {
  const s = slug(name)
  return `/logos/${s}.svg` // bạn có thể dùng .png nếu muốn
}
function deviconLogo(name) {
  const key = name.toLowerCase()
  const icon = deviconMap[key] || deviconMap[key.replace(/\s+3$/, '')] || null
  if (!icon) return null
  // devicon original svg
  return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg`
}
// trình tự: local -> devicon -> generic
function logoFor(name) {
  const urlLocal = localLogo(name)
  // ta cứ trả local trước; nếu 404, dùng @error trên <img> để fallback devicon/generic
  return urlLocal
}
function onLogoError(e, name) {
  const dev = deviconLogo(name)
  if (dev && e.target.dataset.fallback !== 'devicon') {
    e.target.dataset.fallback = 'devicon'
    e.target.src = dev
    return
  }
  // generic gradient
  e.target.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#22d3ee"/>
          <stop offset="1" stop-color="#a78bfa"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="28" font-family="Arial" fill="#0b1220">${(name||'?').slice(0,2).toUpperCase()}</text>
    </svg>
  `)
}

/** ==== REVEAL ==== **/
function setupReveal() {
  const els = document.querySelectorAll('.reveal')
  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) { els.forEach(el => el.classList.add('in')); return }
  io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in') })
  }, { threshold: 0.12 })
  els.forEach(el => io.observe(el))
}
</script>

<template>
  <div class="skills-wrap">
    <div class="bg-deco" aria-hidden="true"></div>

    <div class="container">
      <SectionTitle :title="t('skills.title','Kỹ năng')">
        <!-- Controls -->
        <div class="controls reveal glass">
          <div class="chips">
            <button
                v-for="g in groups"
                :key="g"
                :class="['chip', {active: selected===g}]"
                @click="selected=g"
            >
              {{ g }}
            </button>
          </div>
          <div class="search">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input :placeholder="t('skills.search','Tìm kỹ năng...')" v-model="q" />
          </div>
        </div>

        <!-- Featured -->
        <div class="featured reveal glass">
          <h3>{{ t('skills.featured','Nhóm kỹ năng nổi bật') }}</h3>
          <div class="feat-grid">
            <div class="feat" v-for="s in featured" :key="s.name" :title="s.name + ' (' + (s.group || 'Skill') + ')'">
              <div class="logo">
                <img :src="logoFor(s.name)" :alt="s.name" @error="e=>onLogoError(e,s.name)" loading="lazy" />
              </div>
              <div class="meta text-truncate">
                <strong class="text-truncate">{{ s.name }}</strong>
                <span class="muted text-truncate">{{ s.group || 'Skill' }}</span>
              </div>
              <div class="pbar"><i :style="{ width: levelPct(s.level) + '%' }"></i></div>
            </div>
          </div>
        </div>
      </SectionTitle>

      <!-- All skills -->
      <section class="skills-grid reveal glass">
        <h3 class="sec-title">{{ t('skills.all','Tất cả kỹ năng') }}</h3>
        <div class="grid">
          <div
              v-for="s in filtered"
              :key="s.name"
              class="card"
              :aria-label="s.name"
              :title="s.name + ' (' + (s.group || 'Skill') + ')'"
          >
            <div class="icon">
              <img :src="logoFor(s.name)" :alt="s.name" @error="e=>onLogoError(e,s.name)" loading="lazy" />
            </div>
            <div class="name text-truncate">{{ s.name }}</div>
            <div class="group muted text-truncate">{{ s.group || 'Skill' }}</div>
            <div class="bar"><i :style="{ width: levelPct(s.level) + '%' }"></i></div>
            <div class="level muted">{{ s.level }}/5</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* background */
.skills-wrap{ position:relative }
.bg-deco{
  position:absolute; inset:0; z-index:0; pointer-events:none;
  background:
      radial-gradient(1000px 500px at 90% 10%, rgba(34,211,238,.10), transparent 60%),
      radial-gradient(800px 500px at 8% 25%, rgba(167,139,250,.10), transparent 60%);
}
.container{ position:relative; z-index:1 }

/* glass */
.glass{
  background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.10);
  border-radius:16px;
  box-shadow:0 10px 30px rgba(0,0,0,.35);
  padding: .9rem;
  margin-bottom: 1rem;
}

/* controls */
.controls{ display:flex; gap:.75rem; align-items:center; flex-wrap:wrap; justify-content:space-between }
.chips{ display:flex; gap:.5rem; flex-wrap:wrap }
.chip{
  padding:.35rem .7rem; border-radius:999px; cursor:pointer;
  border:1px solid rgba(255,255,255,.15); background:transparent; color:inherit;
}
.chip.active{ background:rgba(255,255,255,.10) }
.search{
  display:flex; align-items:center; gap:.4rem;
  padding:.35rem .6rem; border:1px solid rgba(255,255,255,.12); border-radius:10px;
  background:rgba(255,255,255,.04);
}
.search input{
  background:transparent; border:0; outline:none; color:inherit; min-width: 180px;
}

/* featured */
.featured h3{ margin:0 0 .6rem }
.feat-grid{
  display:grid; gap:.75rem; grid-template-columns: 1fr;
}
@media (min-width: 800px){
  .feat-grid{ grid-template-columns: repeat(3, minmax(0,1fr)) }
}
.feat{
  display:grid; grid-template-columns: 52px 1fr; gap:.6rem; align-items:center;
  padding:.6rem; border:1px solid rgba(255,255,255,.10); border-radius:12px;
  background:linear-gradient(180deg, rgba(255,255,255,.04), transparent);
  transition: transform .18s ease, border-color .18s ease;
}
.feat:hover{ transform: translateY(-3px); border-color:#22d3ee55 }
.feat .logo{
  width:52px; height:52px; display:grid; place-items:center; border-radius:12px;
  background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08);
}
.feat .logo img{ width: 34px; height:34px; object-fit:contain }
.feat .meta{ display:flex; flex-direction:column }
.pbar{
  grid-column: 1 / -1; height:8px; border-radius:999px; overflow:hidden;
  background:rgba(255,255,255,.08); margin-top:.3rem;
}
.pbar i{ display:block; height:100%; background:linear-gradient(90deg, #22d3ee, #a78bfa) }

/* all skills grid */
.skills-grid .sec-title{ margin:0 0 .5rem }
.grid{
  display:grid; gap:.75rem;
  grid-template-columns: repeat(2, minmax(0,1fr));
}
@media (min-width: 900px){
  .grid{ grid-template-columns: repeat(4, minmax(0,1fr)) }
}
.card{
  display:grid; grid-template-rows: auto auto auto auto auto; align-items:center;
  gap:.25rem; padding:.75rem; border-radius:14px;
  border:1px solid rgba(255,255,255,.10); background:rgba(255,255,255,.04);
  transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
}
.card:hover{
  transform: translateY(-4px);
  border-color:#22d3ee55;
  box-shadow:0 10px 20px rgba(0,0,0,.25);
}
.icon{
  width:56px; height:56px; display:grid; place-items:center; border-radius:12px;
  background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08);
  margin-bottom:.25rem;
}
.icon img{ width:36px; height:36px; object-fit:contain }
.name{ font-weight:700 }
.group{ font-size:.9rem }
.bar{
  height:8px; background:rgba(255,255,255,.08); border-radius:999px; overflow:hidden; width:100%;
}
.bar i{ display:block; height:100%; background:linear-gradient(90deg, #22d3ee, #a78bfa) }
.level{ font-size:.85rem; justify-self:end }

/* reveal */
.reveal{ opacity:0; transform: translateY(12px); transition: all .28s ease }
.reveal.in{ opacity:1; transform: translateY(0) }
.muted{ color:#a3a7b3 }
</style>
