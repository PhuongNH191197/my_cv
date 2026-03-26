<!-- ProjectModal.vue - Redesigned for Airy Premium Feel -->
<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="project" class="modal-overlay" @click.self="$emit('close')" role="dialog" aria-modal="true">
        <div class="modal airy-modal">
          <!-- Top-Right Close Button (Standard Lightbox Style) -->
          <button class="top-close" @click="$emit('close')" :aria-label="t('projects.details.close')">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <div class="modal-content custom-scroll">
            <!-- Hero Title -->
            <header class="hero-header">
              <h1>{{ project.name }}</h1>
            </header>

            <!-- Premium Info List (No boxes, just airy rows) -->
            <div class="airy-info">
              <div class="airy-row status-highlight">
                <span class="lbl">{{ t('projects.details.status') }}</span>
                <span class="badge" :class="statusClass">
                  {{ t(`projects.status.${normalizedStatus}`) }}
                </span>
              </div>
              <div class="airy-row">
                <span class="lbl">{{ t('projects.details.client') }}</span>
                <span class="val">{{ project.client }}</span>
              </div>
              <div class="airy-row">
                <span class="lbl">{{ t('projects.details.domain') }}</span>
                <span class="val">{{ project.domain }}</span>
              </div>
              <div class="airy-row">
                <span class="lbl">{{ t('projects.details.country') }}</span>
                <span class="val">{{ project.country }}</span>
              </div>
              <div class="airy-row">
                <span class="lbl">{{ t('projects.details.year') }}</span>
                <span class="val">{{ project.year }}</span>
              </div>
              <div class="airy-row">
                <span class="lbl">{{ t('projects.details.type') }}</span>
                <span class="val">{{ t(`projects.types.${normalizedType}`) }}</span>
              </div>
            </div>

            <div class="main-details">
              <!-- Summary -->
              <section class="sec summary-sec">
                <p>{{ project.summary }}</p>
              </section>

              <!-- Responsibilities -->
              <section v-if="project.responsibilities?.length" class="sec">
                <h3><i class="fa-solid fa-circle-check"></i> {{ t('projects.details.responsibilities') }}</h3>
                <ul class="task-list">
                  <li v-for="(r,i) in project.responsibilities" :key="i">{{ r }}</li>
                </ul>
              </section>

              <!-- Tags -->
              <div class="tags-container">
                <section v-if="project.protocols?.length" class="sec">
                  <h3><i class="fa-solid fa-shield-halved"></i> {{ t('projects.details.protocols') }}</h3>
                  <div class="tag-wrap">
                    <span v-for="p in project.protocols" :key="p" class="pill">{{ p }}</span>
                  </div>
                </section>

                <section v-if="project.tech?.length" class="sec">
                  <h3><i class="fa-solid fa-terminal"></i> {{ t('projects.details.technologies') }}</h3>
                  <div class="tag-wrap highlighting">
                    <span v-for="tch in project.tech" :key="tch" class="pill tech-pill">{{ tch }}</span>
                  </div>
                </section>
              </div>

              <!-- Links -->
              <section v-if="hasLinks" class="sec links-sec">
                <div class="action-buttons">
                  <a v-if="project.demo" :href="project.demo" target="_blank" class="airy-btn glow">
                    <i class="fa-solid fa-bolt"></i> {{ t('projects.details.demo') }}
                  </a>
                  <a v-if="project.repo" :href="project.repo" target="_blank" class="airy-btn secondary">
                    <i class="fa-brands fa-github"></i> Repository
                  </a>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()

const normalizedStatus = computed(() => {
  const s = (props.project?.status || '').toString().trim().toLowerCase()
  if (s === 'progress' || s === 'in_progress' || s === 'ongoing') return 'active'
  if (['active', 'shipped', 'archived'].includes(s)) return s
  return 'active'
})

const normalizedType = computed(() => {
  const t = (props.project?.type || '').toString().trim().toLowerCase()
  const allowed = ['web', 'backend', 'data', 'devops', 'mobile', 'ml']
  return allowed.includes(t) ? t : 'web'
})

const statusClass = computed(() => normalizedStatus.value)
const hasLinks = computed(() => !!(props.project?.demo || props.project?.repo))
</script>

<style scoped>
/* Overlay */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(5, 8, 15, 0.94);
  display: flex; align-items: center; justify-content: center;
  z-index: 999999;
  backdrop-filter: blur(25px);
  padding: env(safe-area-inset-top, 20px) 15px env(safe-area-inset-bottom, 20px);
}

/* Modal Frame */
.airy-modal {
  background: rgba(10, 15, 25, 0.98);
  color: var(--fg);
  width: 100vw; height: 100vh;
  max-width: 100%; max-height: 100%;
  border-radius: 0;
  position: relative;
  display: flex; flex-direction: column;
  box-sizing: border-box;
  animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* Top Left Close Button - Sticky/Fixed */
.top-close {
  position: fixed; top: 1.5rem; right: 1.5rem; z-index: 1000;
  background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); 
  color: white; width: 44px; height: 44px; border-radius: 50%;
  cursor: pointer; 
  display: grid; place-items: center;
  transition: all 0.3s ease;
  box-sizing: border-box;
  padding: 0; margin: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.top-close i { font-size: 1.2rem; line-height: 1; }
.top-close:hover { background: rgba(255, 255, 255, 0.2); transform: rotate(-90deg); }

/* Animation Overlay */
.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.4s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* Content Wrapper */
.modal-content {
  padding: 5rem 2rem 3rem; /* Extra top padding for the fixed button */
  overflow-y: auto; flex: 1;
  box-sizing: border-box;
  width: 100%; max-width: 900px; margin: 0 auto;
}

/* Hero Title */
.hero-header { margin-bottom: 2.5rem; text-align: center; }
.hero-header h1 { 
  font-family: var(--font-serif); font-size: 2.5rem; font-weight: 800; 
  margin: 0; line-height: 1.2; letter-spacing: -1px;
}

/* Airy Info List */
.airy-info {
  margin-bottom: 3.5rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1rem;
}
.airy-row { 
  display: flex; align-items: center; justify-content: space-between; 
  padding: 0.85rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); 
}
.airy-row:last-child { border-bottom: 0; }
.airy-row .lbl { font-size: 0.85rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
.airy-row .val { font-size: 1.05rem; font-weight: 700; text-align: right; color: var(--fg); }

/* Status Row Highlights */
.status-highlight { 
  background: rgba(255,255,255,0.03); border-radius: 16px; margin: 0.5rem 0 1rem;
  padding: 0.85rem 1.25rem; border: 1px solid rgba(255,255,255,0.06); 
}
.badge { padding: 0.4rem 1rem; border-radius: 10px; font-size: 0.8rem; font-weight: 900; text-transform: uppercase; }
.badge.shipped { background: rgba(16, 185, 129, 0.15); color: #4ade80; border: 1px solid rgba(16, 185, 129, 0.2); }
.badge.active { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.2); }
.badge.archived { background: rgba(148, 163, 184, 0.15); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.2); }

/* Details Sections */
.main-details { display: flex; flex-direction: column; gap: 3rem; }
.sec h3 { font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
.sec h3 i { font-size: 1rem; opacity: 0.7; }

.summary-sec p { font-size: 1.2rem; line-height: 1.8; opacity: 0.95; margin: 0; }

.task-list { list-style: none; padding-left: 1.5rem; display: flex; flex-direction: column; gap: 1.2rem; }
.task-list li { position: relative; line-height: 1.7; font-size: 1.1rem; }
.task-list li::before { content: "•"; position: absolute; left: -1.5rem; color: var(--primary); font-weight: bold; font-size: 1.4rem; top: -0.1rem; }

/* Tags */
.tags-container { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
.tag-wrap { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.pill { 
  padding: 0.45rem 1rem; border-radius: 14px; 
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); 
  font-size: 0.9rem; font-weight: 600; color: var(--muted); 
}
.tech-pill { border-color: rgba(34, 211, 238, 0.3); color: var(--secondary); background: rgba(34, 211, 238, 0.06); }

/* Links */
.action-buttons { display: flex; gap: 1.25rem; }
.airy-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 1.15rem; border-radius: 20px; text-decoration: none; font-weight: 800; font-size: 1.05rem; transition: all 0.4s ease; }
.airy-btn.glow { background: var(--primary); color: #0b1220; box-shadow: 0 15px 35px var(--primary-glow); }
.airy-btn.secondary { background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(255, 255, 255, 0.15); }
.airy-btn:hover { transform: translateY(-6px); filter: brightness(1.25); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }

/* Custom Scroll */
.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }

@media (max-width: 768px) {
  .modal-content { padding: 2.25rem 1.75rem; }
  .hero-header { margin-bottom: 2rem; }
  .hero-header h1 { font-size: 1.65rem; }
  .top-close { top: 1.25rem; right: 1.25rem; width: 40px; height: 40px; }
  .tags-container { grid-template-columns: 1fr; gap: 2.5rem; }
  .airy-row .lbl { font-size: 0.75rem; }
  .airy-row .val { font-size: 0.95rem; }
  .status-highlight { padding: 0.75rem 1rem; }
  .summary-sec p { font-size: 1.1rem; }
}
</style>
