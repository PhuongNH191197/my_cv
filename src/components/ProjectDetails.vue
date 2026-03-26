<!-- ProjectModal.vue -->
<template>
  <div class="modal-overlay" @click.self="$emit('close')" role="dialog" aria-modal="true">
    <div class="modal">
      <header class="modal-header">
        <h2 class="text-truncate" :title="project.name">{{ project.name }}</h2>

        <!-- Badge trạng thái: dùng key i18n & class theo status -->
        <span class="badge" :class="statusClass" style="flex-shrink: 0">
          {{ t(`projects.status.${normalizedStatus}`) }}
        </span>

        <button class="close-btn" @click="$emit('close')" :aria-label="t('projects.details.close')" style="flex-shrink: 0">✕</button>
      </header>

      <!-- Grid Info -->
      <div class="info-grid">
        <div class="text-truncate">
          <strong>{{ t('projects.details.client') }}</strong>
          <p class="text-truncate" :title="project.client">{{ project.client }}</p>
        </div>
        <div class="text-truncate">
          <strong>{{ t('projects.details.domain') }}</strong>
          <p class="text-truncate" :title="project.domain">{{ project.domain }}</p>
        </div>
        <div class="text-truncate">
          <strong>{{ t('projects.details.country') }}</strong>
          <p class="text-truncate" :title="project.country">{{ project.country }}</p>
        </div>
        <div class="text-truncate">
          <strong>{{ t('projects.details.year') }}</strong>
          <p class="text-truncate" :title="project.year">{{ project.year }}</p>
        </div>
        <div class="text-truncate">
          <strong>{{ t('projects.details.type') }}</strong>
          <p class="text-truncate" :title="t(`projects.types.${normalizedType}`)">{{ t(`projects.types.${normalizedType}`) }}</p>
        </div>
        <div class="text-truncate">
          <strong>{{ t('projects.details.status') }}</strong>
          <p class="text-truncate" :title="t(`projects.status.${normalizedStatus}`)">{{ t(`projects.status.${normalizedStatus}`) }}</p>
        </div>
      </div>

      <!-- Summary -->
      <p class="summary">{{ project.summary }}</p>

      <!-- Responsibilities -->
      <section v-if="project.responsibilities?.length">
        <h3>{{ t('projects.details.responsibilities') }}</h3>
        <ul class="list">
          <li v-for="(r,i) in project.responsibilities" :key="i">
            <i class="fa-solid fa-check"></i> {{ r }}
          </li>
        </ul>
      </section>

      <!-- Protocols -->
      <section v-if="project.protocols?.length">
        <h3>{{ t('projects.details.protocols') }}</h3>
        <div class="tags">
          <span v-for="p in project.protocols" :key="p" class="tag">{{ p }}</span>
        </div>
      </section>

      <!-- Technologies -->
      <section v-if="project.tech?.length">
        <h3>{{ t('projects.details.technologies') }}</h3>
        <div class="tags">
          <span v-for="tch in project.tech" :key="tch" class="tag">{{ tch }}</span>
        </div>
      </section>

      <!-- Links (Demo / Repo) -->
      <section v-if="hasLinks">
        <h3>{{ t('projects.details.links') }}</h3>
        <div class="links">
          <a v-if="project.demo" class="btn-link" :href="project.demo" target="_blank" rel="noopener">
            {{ t('projects.details.demo') }}
          </a>
          <a v-if="project.repo" class="btn-link" :href="project.repo" target="_blank" rel="noopener">
            {{ t('projects.details.repo') }}
          </a>
        </div>
      </section>

      <footer class="modal-footer">
        <button class="btn" @click="$emit('close')">{{ t('projects.details.close') }}</button>
      </footer>
    </div>
  </div>
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

/**
 * Chuẩn hoá status/type để map sang i18n keys:
 * - status: active | shipped | archived (map từ progress -> active)
 * - type: web | backend | data | devops | mobile | ml
 */
const normalizedStatus = computed(() => {
  const s = (props.project?.status || '').toString().trim().toLowerCase()
  if (s === 'progress' || s === 'in_progress' || s === 'ongoing') return 'active'
  if (['active', 'shipped', 'archived'].includes(s)) return s
  // fallback
  return 'active'
})

const normalizedType = computed(() => {
  const t = (props.project?.type || '').toString().trim().toLowerCase()
  const allowed = ['web', 'backend', 'data', 'devops', 'mobile', 'ml']
  return allowed.includes(t) ? t : 'web'
})

const statusClass = computed(() => normalizedStatus.value) // dùng làm class badge

const hasLinks = computed(() => !!(props.project?.demo || props.project?.repo))
</script>

<style scoped>
/* Overlay */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.65);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000;
}

/* Modal */
.modal {
  overflow-y: auto;
  max-height: 92vh;
  background: var(--surface);
  color: var(--fg);
  width: 720px; max-width: 95%;
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: 0 32px 64px rgba(0,0,0,0.6);
  position: relative;
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(10px);
  animation: slideIn .4s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideIn { from { opacity: 0; transform: scale(0.95) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }

/* Header */
.modal-header {
  display: flex; align-items: center; gap: 1rem;
  justify-content: space-between;
  margin-bottom: 2rem;
}
.modal-header h2 { font-size: 1.8rem; font-weight: 800; margin: 0; }
.badge {
  padding: 0.35rem 0.85rem; border-radius: 999px;
  font-size: 0.85rem; font-weight: 700;
}
.badge.shipped { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.badge.active { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
.badge.archived { background: rgba(148, 163, 184, 0.15); color: #94a3b8; }

.close-btn { background: rgba(255,255,255,0.05); border: 0; color: var(--muted); width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: var(--transition-smooth); }
.close-btn:hover { background: rgba(255,255,255,0.1); color: var(--fg); }

/* Grid Info */
.info-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1.25rem;
  margin-bottom: 2rem;
}
.info-grid div {
  background: rgba(255,255,255,0.03);
  padding: 1rem; border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}
.info-grid strong { display: block; color: var(--muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem; }
.info-grid p { margin: 0; font-weight: 700; font-size: 1rem; color: var(--fg); }

/* Sections */
.summary { margin: 1.5rem 0; line-height: 1.8; font-size: 1.1rem; color: var(--fg); }
h3 { margin: 2rem 0 1rem; font-size: 1.2rem; font-weight: 800; font-family: var(--font-serif); }

/* Responsibilities */
.list { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.75rem; }
.list li { display: flex; gap: 0.85rem; align-items: flex-start; line-height: 1.5; }
.list i { color: var(--primary); margin-top: 0.35rem; font-size: 0.9rem; }

/* Tags */
.tags { display: flex; flex-wrap: wrap; gap: 0.65rem; margin-top: 0.5rem; }
.tag {
  padding: 0.45rem 1rem; border-radius: 10px;
  background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border);
  font-size: 0.9rem; font-weight: 500;
  transition: var(--transition-smooth);
}
.tag:hover { border-color: var(--primary); color: var(--primary); transform: translateY(-2px); }

/* Links */
.links { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1rem; }
.btn-link {
  display: inline-flex; align-items: center; gap: 0.6rem;
  padding: 0.75rem 1.5rem; border-radius: var(--radius-md);
  background: var(--surface); border: 1px solid var(--glass-border);
  color: var(--fg); text-decoration: none; font-weight: 700;
  transition: var(--transition-smooth);
}
.btn-link:hover { border-color: var(--primary); transform: translateY(-3px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.3); }

/* Footer */
.modal-footer { margin-top: 2.5rem; border-top: 1px solid var(--glass-border); padding-top: 1.5rem; text-align: right; }
.btn {
  padding: 0.75rem 2rem; border-radius: var(--radius-md); border: 0;
  background: var(--primary); color: #0b1220; font-weight: 800; cursor: pointer;
  transition: var(--transition-smooth);
}
.btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px var(--primary-glow); }
</style>
