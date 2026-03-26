<script setup>
import {ref, computed, onMounted} from 'vue'
import { useResumeStore } from '@/stores/resume.store'
import { useI18n } from 'vue-i18n'
import ProjectDetails from '@/components/ProjectDetails.vue'

const { t } = useI18n()
const store = useResumeStore()

onMounted(async () => {
  if (!store.resume?.projects) await store.load()
})

const q = ref('')              // search
const domain = ref('all')      // ngành (Telecom, Education,…)
const tech = ref('all')        // công nghệ
// (nếu sau thêm: type/status, bạn chỉ việc thêm select tương tự)

// modal state
const selected = ref(null)
function open(p){ selected.value = p }
function close(){ selected.value = null }

const projects = computed(() => store.resume?.projects || [])

// Tạo danh sách unique cho dropdown
const domains = computed(() => {
  const set = new Set(projects.value.map(p => p.domain).filter(Boolean))
  return ['all', ...Array.from(set)]
})
const techs = computed(() => {
  const set = new Set()
  projects.value.forEach(p => (p.tech || []).forEach(t => set.add(t)))
  return ['all', ...Array.from(set)]
})
function statusClass(s) {
  const x = (s || '').toString().trim().toLowerCase()
  if (x === 'progress' || x === 'in_progress' || x === 'ongoing') return 'active'
  if (['active', 'shipped', 'archived'].includes(x)) return x
  return 'active' // fallback
}

// Lọc
const filtered = computed(() => {
  const keyword = q.value.trim().toLowerCase()
  return projects.value.filter(p => {
    const okDomain = domain.value === 'all' || p.domain === domain.value
    const okTech = tech.value === 'all' || (p.tech || []).includes(tech.value)
    const haystack = [
      p.name, p.summary, p.client, p.country,
      ...(p.tech || []), ...(p.protocols || [])
    ].join(' ').toLowerCase()
    const okSearch = !keyword || haystack.includes(keyword)
    return okDomain && okTech && okSearch
  })
})
</script>

<template>
  <div class="container">
    <h2 class="page-title">{{ t('projects.title') }}</h2>

    <!-- FILTER BAR -->
    <div class="filters">
      <div class="search">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input
            v-model="q"
            :placeholder="t('projects.search')"
            autocomplete="off"
        />
      </div>

      <select v-model="domain" class="select">
        <option value="all">{{ t('projects.allDomains') }}</option>
        <option v-for="d in domains.slice(1)" :key="d" :value="d">{{ d }}</option>
      </select>

      <select v-model="tech" class="select">
        <option value="all">{{ t('projects.allTech') }}</option>
        <option v-for="x in techs.slice(1)" :key="x" :value="x">{{ x }}</option>
      </select>
    </div>

    <!-- grid -->
    <div class="grid">
      <article
          v-for="p in filtered"
          :key="p.id"
          class="card link"
          role="button"
          tabindex="0"
          @click="open(p)"
          @keydown.enter.prevent="open(p)"
      >
        <header class="card-head">
          <span v-if="p.domain" class="badge domain text-truncate" :title="p.domain" style="max-width: 120px">{{ p.domain }}</span>

          <span
              class="badge"
              :class="statusClass(p.status)"
          >
            {{ t('projects.status.' + statusClass(p.status)) }}
          </span>
        </header>
        <div
            class="thumb"
            :class="{ 'has-image': !!p.bgCover }"
            :style="p.bgCover ? { '--bg': `url(${p.bgCover?.startsWith('/') ? p.bgCover : '/' + p.bgCover})` } : null"
        >
          <i v-if="!p.bgCover" class="fa-solid fa-image icon"></i>
          <span v-else class="thumb-fade"></span>
        </div>
        <h3 class="title text-truncate" :title="p.name">{{ p.name }}</h3>
        <p class="client muted text-truncate" :title="p.client">
          <i class="fa-solid fa-building"></i>
          <span>{{ p.client }}</span>
<!--          <span v-if="p.country">· {{ p.country }}</span>-->
<!--          <span v-if="p.year">· {{ p.year }}</span>-->
        </p>
        <p class="desc line-clamp-2" :title="p.summary">{{ p.summary }}</p>
        <div class="chips">
          <span class="chip text-truncate" v-for="tch in p.tech" :key="tch" :title="tch" style="max-width: 120px">{{ tch }}</span>
        </div>
      </article>

      <p v-if="!filtered.length" class="muted" style="grid-column:1/-1">
        {{ t('common.noResults') }}
      </p>
    </div>

    <!-- MODAL -->
    <ProjectDetails v-if="selected" :project="selected" @close="close" />
  </div>
</template>

<style scoped>
.page-title{ margin-bottom:.75rem }
.filters{
  display:flex; gap:.6rem; flex-wrap:wrap; align-items:center;
  margin-bottom: 1rem;
}
.search{
  display:flex; align-items:center; gap:.5rem;
  border:1px solid rgba(255,255,255,.15); border-radius:12px;
  padding:.45rem .6rem; background:rgba(255,255,255,.06);
}
.search input{
  background:transparent; border:0; outline:none; color:#e5e7eb; min-width: 220px;
}

/* select dark (đồng bộ với phần trước) */
.select{
  appearance:none; -webkit-appearance:none; color-scheme: dark;
  background: rgba(255,255,255,.06); color:#e5e7eb;
  border:1px solid rgba(255,255,255,.15); border-radius:12px;
  padding:.45rem 2rem .45rem .6rem;
  background-image:
      url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 20 20' fill='none' stroke='%23cbd5e1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 8 10 12 14 8'/></svg>");
  background-repeat:no-repeat; background-position:right .6rem center; background-size:14px;
}
.select option{ background:#0b1220; color:#e5e7eb }
.select:focus{ outline:none; border-color:#22d3ee66; box-shadow:0 0 0 3px rgba(34,211,238,.15) }

@media (max-width: 640px) {
  .filters {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  .search {
    grid-column: span 2;
  }
  .search input {
    min-width: 0;
    width: 100%;
  }
  .select {
    width: 100%;
    padding-right: 1.5rem;
    background-position: right .4rem center;
  }
}

.grid{
  display:grid; gap:1rem;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}
.card{
  background: rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.10);
  border-radius:16px; padding:.9rem;
  display:flex; flex-direction:column; gap:.5rem;
}
.card-head{ display:flex; justify-content:space-between }
.badge{
  font-size:.8rem; padding:.2rem .5rem; border-radius:999px;
  border:1px solid rgba(255,255,255,.15); background:rgba(255,255,255,.07);
}
.badge.soft{ background:#22d3ee22; border-color:#22d3ee55; color:#a5f3fc }



.title{ margin:.25rem 0 0 }
.client{ display:flex; align-items:center; gap:.35rem }
.desc{ line-height:1.55 }

.chips{ display:flex; gap:.4rem; flex-wrap:wrap }
.row{ margin-top:.1rem }
.chip{
  display: inline-block;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
  padding:.25rem .55rem; border-radius:999px;
  border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.06); font-size:.85rem;
}
.chip.ghost{ background:transparent }
.muted{ color:#a3a7b3 }

.card.link{ cursor:pointer; transition: transform .12s ease, border-color .12s ease }
.card.link:hover{ transform: translateY(-2px); border-color:#22d3ee66 }


.card-head{ display:flex; justify-content:space-between; gap:.4rem; align-items:center }

/* Base badge */
.badge{
  font-size:.8rem; padding:.2rem .5rem; border-radius:999px;
  border:1px solid rgba(255,255,255,.15); background:rgba(255,255,255,.07);
  display:inline-flex; align-items:center; gap:.35rem; font-weight:600;
}

/* Domain badge (trung tính) */
.badge.domain{
  display: inline-block;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
  background:rgba(255,255,255,.07);
  border-color:rgba(255,255,255,.15);
  color:#e5e7eb;
}

/* Trạng thái — giống màu trong ProjectDetails */
.badge.shipped  { background:#16a34a33; border-color:#16a34a66; color:#4ade80; }
.badge.active   { background:#eab30833; border-color:#eab30866; color:#facc15; }
.badge.archived { background:#334155;   border-color:#334155;   color:#cbd5e1; }

/* (Tuỳ chọn) bỏ rule cũ nếu còn dùng: .badge.soft */



.thumb{
  position: relative;
  height:140px; border-radius:12px;
  border:1px dashed rgba(255,255,255,.15);
  display:flex; align-items:center; justify-content:center;
  background:rgba(255,255,255,.03);
  overflow: hidden;
}

/* Khi có ảnh: đổi viền, set background bằng CSS variable --bg */
.thumb.has-image{
  border-style: solid; border-color: rgba(255,255,255,.12);
  background:#0b1224;
}
.thumb.has-image::before{
  content:'';
  position:absolute; inset:0; z-index:0;
  background-image: var(--bg);
  background-size: cover;
  background-position: center;
  transform: scale(1);
  transition: transform .25s ease;
  filter: saturate(1.05) contrast(1.02);
}
.card.link:hover .thumb.has-image::before{ transform: scale(1.03) }

/* phủ 1 lớp gradient nhẹ để chữ phía dưới dễ đọc hơn (optional) */
.thumb-fade{
  position:absolute; inset:0; z-index:1;
  background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,.35) 100%);
}

.thumb .icon{ font-size:1.6rem; color:#94a3b8; z-index:1 }


</style>
