<script setup>
import { computed, onMounted, onBeforeUnmount, ref, nextTick } from 'vue'
import SectionTitle from '@/components/SectionTitle.vue'
import { useResumeStore } from '@/stores/resume.store'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const store = useResumeStore()

let io // IntersectionObserver instance

onMounted(async () => {
  if (!store.resume?.profile) await store.load()
  await nextTick()
  setupReveal()
})

onBeforeUnmount(() => {
  if (io) io.disconnect()
})

const profile   = computed(() => store.resume?.profile || {})
const about     = computed(() => store.resume?.about || {})
const certs     = computed(() => store.resume?.certs || [])
const langs     = computed(() => store.resume?.languages || [])
const socials   = computed(() => store.resume?.socials || [])
const education = computed(() => store.resume?.education || [])

// Tiểu sử ưu tiên about.bio (mảng đoạn văn). Fallback sang summary
const bioParas = computed(() => {
  const bio = store.resume?.about?.bio
  if (Array.isArray(bio) && bio.length) return bio
  return profile.value.summary ? [profile.value.summary] : []
})

// Reveal on scroll
function setupReveal() {
  const els = document.querySelectorAll('.reveal')
  // tắt animation nếu user chọn giảm chuyển động
  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) {
    els.forEach(el => el.classList.add('in'))
    return
  }
  io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in') })
  }, { threshold: 0.15 })
  els.forEach(el => io.observe(el))
}
</script>

<template>
  <div class="about-wrap">
    <div class="bg-deco" aria-hidden="true"></div>

    <div class="container about">
      <SectionTitle :title="t('about.title','Giới thiệu')">
        <!-- HERO -->
        <div class="hero glass reveal">
          <div class="avatar-wrap" aria-hidden="true">
            <span class="ring"></span>
            <img
                class="avatar"
                :src="profile.avatar || '/avatar.jpg'"
                alt="avatar"
                loading="lazy"
            />
          </div>

          <div class="info text-truncate">
            <h2 class="name text-truncate" :title="profile.name">{{ profile.name }}</h2>
            <p class="muted text-truncate" :title="profile.title + ' · ' + profile.location">
              {{ profile.title }} · {{ profile.location }}
            </p>

            <p v-if="profile.headline" class="headline">{{ profile.headline }}</p>
            <p v-if="profile.summary" class="summary">{{ profile.summary }}</p>

            <div class="chips">
              <span v-if="about.stats?.years" class="chip stat">
                <i class="fa-solid fa-calendar"></i> {{ about.stats.years }}+ {{ t('about.years','năm') }}
              </span>
              <span v-if="about.stats?.projects" class="chip stat">
                <i class="fa-solid fa-folder-open"></i> {{ about.stats.projects }} {{ t('about.projects','dự án') }}
              </span>
              <span v-if="about.stats?.talks" class="chip stat">
                <i class="fa-solid fa-comments"></i> {{ about.stats.talks }} {{ t('about.talks','bài nói') }}
              </span>
              <span v-if="profile.availability" class="chip avail">
                <i class="fa-solid fa-circle" style="font-size:.6rem"></i> {{ profile.availability }}
              </span>
            </div>

            <div class="values" v-if="about.values?.length">
              <span v-for="v in about.values" :key="v" class="value">#{{ v }}</span>
            </div>

            <div class="cta">
              <a class="btn primary" href="/cv/PhuongNguyen_CV.pdf" target="_blank" rel="noopener noreferrer">
                <i class="fa-solid fa-file-lines"></i> {{ t('about.downloadCV','Tải CV') }}
              </a>
              <router-link class="btn" to="/contact">
                <i class="fa-solid fa-envelope"></i> {{ t('about.contact','Liên hệ') }}
              </router-link>
              <a
                  v-for="s in socials"
                  :key="s.name"
                  class="btn ghost"
                  :href="s.url"
                  target="_blank"
                  rel="noopener noreferrer"
              >
                {{ s.name }}
              </a>
            </div>
          </div>
        </div>
      </SectionTitle>

      <!-- BIO -->
      <section class="glass section reveal" v-if="bioParas.length">
        <h3>{{ t('about.bioTitle','Tiểu sử') }}</h3>
        <div class="bio">
          <p v-for="(p,i) in bioParas" :key="i">{{ p }}</p>
        </div>
      </section>

      <!-- INTERESTS -->
      <section class="glass section reveal" v-if="about.interests?.length">
        <h3>{{ t('about.interests','Sở thích') }}</h3>
        <div class="chips interests">
          <span class="chip" v-for="i in about.interests" :key="i">
            <i class="fa-solid fa-star"></i> {{ i }}
          </span>
        </div>
      </section>

      <!-- GRID: EDUCATION / CERTS & LANGS -->
      <div class="grid2">
        <section class="glass section reveal" v-if="education.length">
          <h3>{{ t('about.educationTitle','Học vấn') }}</h3>
          <ul class="timeline">
            <li v-for="(e,i) in education" :key="i">
              <div class="dot"></div>
              <div class="row text-truncate">
                <strong class="text-truncate" :title="e.degree">{{ e.degree }}</strong>
                <span class="muted" style="flex-shrink: 0">{{ e.from }} — {{ e.to || t('about.now','hiện tại') }}</span>
              </div>
              <div class="school muted text-truncate" :title="e.school">{{ e.school }}</div>
              <ul class="hl" v-if="e.highlights?.length">
                <li v-for="(h,j) in e.highlights" :key="j">{{ h }}</li>
              </ul>
            </li>
          </ul>
        </section>

        <section class="glass section reveal">
          <h3>{{ t('about.certsAndLangs','Chứng chỉ & Ngôn ngữ') }}</h3>
          <div class="twocol">
            <div v-if="certs.length" class="text-truncate">
              <h4>{{ t('about.certs','Chứng chỉ') }}</h4>
              <ul class="plain text-truncate">
                <li v-for="c in certs" :key="c.name" class="text-truncate">
                  <i class="fa-solid fa-circle-check"></i>
                  <span :title="c.name" class="text-truncate">{{ c.name }}</span> <span class="muted">· Trong tương lai</span>
                </li>
              </ul>
            </div>
            <div v-if="langs.length" class="text-truncate">
              <h4>{{ t('about.languages','Ngôn ngữ') }}</h4>
              <ul class="plain text-truncate">
                <li v-for="l in langs" :key="l.name" class="text-truncate">
                  <i class="fa-solid fa-language"></i>
                  <span :title="l.name" class="text-truncate">{{ l.name }}</span> <span class="muted">· {{ l.proficiency }}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== Page background with animated gradient ===== */
.about-wrap { position: relative; overflow: hidden; }
.bg-deco{
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background:
      radial-gradient(1200px 600px at 80% 0%, rgba(34,211,238,.12), transparent 60%),
      radial-gradient(800px 500px at 10% 20%, rgba(99,102,241,.10), transparent 60%);
  filter: saturate(1.1);
}
.bg-deco::after{
  content:""; position:absolute; inset:-40%;
  background: conic-gradient(from 0deg, #22d3ee33, #a78bfa33, #22d3ee33);
  mix-blend-mode: overlay; filter: blur(80px);
  animation: hue 18s linear infinite;
  opacity:.35;
}
@keyframes hue { from{ transform: rotate(0deg) } to{ transform: rotate(360deg) } }

/* ===== Layout ===== */
.about{ position: relative; z-index: 1; }
.section{ padding:1rem;margin-top: 1rem }
.container .section + .section{ margin-top: 1rem }
.grid2{ display:grid; gap:1rem; grid-template-columns:1fr }
@media(min-width: 960px){ .grid2{ grid-template-columns:1fr 1fr } }

/* ===== Glass card ===== */
.glass{
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.10);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,.35);
}

/* ===== Hero ===== */
.hero{
  display:grid; gap: 1.2rem; align-items:center;
  grid-template-columns: 110px 1fr;
  padding: 1.2rem;
}
@media(max-width: 640px){
  .hero{ grid-template-columns: 1fr; text-align: center }
  .info{ display: grid; justify-items: center }
}
.avatar-wrap{ position: relative; width: 110px; height: 110px; margin: 0 auto }
.avatar{
  width:100%; height:100%; border-radius:50%; object-fit:cover;
  position: relative; z-index: 1; border:2px solid rgba(255,255,255,.12);
}
.ring{
  position:absolute; inset:-3px; border-radius:50%;
  background: conic-gradient(#22d3ee, #a78bfa, #22d3ee);
  filter: blur(6px); opacity:.55; animation: spin 6s linear infinite;
}
@keyframes spin { to { transform: rotate(1turn) } }

.name{ margin:0; font-size:1.5rem }
.muted{ color:#a3a7b3 }
.headline{ font-weight:700; margin:.2rem 0 }
.summary{ margin:.25rem 0 .5rem }

.chips{ display:flex; gap:.5rem; flex-wrap:wrap; margin:.45rem 0 }
.chip{
  display:inline-flex; align-items:center; gap:.4rem;
  padding:.25rem .6rem; border-radius:999px;
  border:1px solid rgba(255,255,255,.15);
  background: rgba(255,255,255,.04);
}
.chip.stat:hover{ border-color:#22d3ee55 }
.chip.avail{ border-color:#22d3ee66; background:#22d3ee22; color:#a5f3fc }

.values{ display:flex; gap:.4rem; flex-wrap:wrap; margin:.2rem 0 .4rem }
.value{
  background:rgba(255,255,255,.06); padding:.2rem .5rem; border-radius:8px;
  border:1px solid rgba(255,255,255,.08); transition: transform .15s ease;
}
.value:hover{ transform: translateY(-2px) }

.cta{ display:flex; gap:.5rem; flex-wrap:wrap; margin-top:.4rem }
.btn{
  padding:.45rem .75rem; border-radius:10px; border:1px solid rgba(255,255,255,.12);
  background:transparent; color:inherit; text-decoration:none; display:inline-flex; gap:.4rem; align-items:center;
}
.btn.primary{ background:#22d3ee; color:#0b1220; border-color:#22d3ee; }
.btn.primary:hover{ filter:brightness(1.05) }
.btn.ghost{ background:transparent }

/* ===== Bio / Interests ===== */
.bio{ display:grid; gap:.4rem; line-height:1.7 }
.interests .chip{ background:rgba(255,255,255,.06) }

/* ===== Education Timeline ===== */
.timeline{ list-style:none; margin:0; padding:0; position:relative }
.timeline li{
  position:relative; padding-left: 1.25rem; margin: 0 0 1rem;
}
.timeline li::before{
  content:""; position:absolute; left:.45rem; top:.5rem; bottom:-.5rem;
  width:2px; background: linear-gradient(#334155, transparent);
}
.dot{
  position:absolute; left:.25rem; top:.3rem; width:10px; height:10px; border-radius:50%;
  background:#22d3ee; box-shadow:0 0 0 3px #22d3ee33;
}
.row{ display:flex; justify-content:space-between; gap:.75rem }
.hl{ margin:.35rem 0 0 0; padding-left: 1rem; line-height:1.6 }

/* ===== Certs & Langs ===== */
.twocol{ display:grid; gap:.75rem }
.plain{ list-style:none; margin:.35rem 0 0; padding:0; line-height:1.8 }

/* ===== Reveal animation ===== */
.reveal{ opacity: 0; transform: translateY(12px); transition: all .35s ease }
.reveal.in{ opacity: 1; transform: translateY(0) }
</style>
