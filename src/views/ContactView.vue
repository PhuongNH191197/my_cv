<script setup>
import { ref, computed, onMounted } from 'vue'
import SectionTitle from '@/components/SectionTitle.vue'
import { useResumeStore } from '@/stores/resume.store'

const store = useResumeStore()

onMounted(async () => {
  if (!store.resume?.contact) await store.load()
})

const contact = computed(() => store.resume?.contact || {})

/** Chuẩn hoá tel: giữ +, bỏ khoảng trắng, dấu - và (). */
function normalizePhoneToTel(phone) {
  if (!phone) return ''
  return phone.replace(/[^+\d]/g, '')
}

/** Thêm protocol nếu người dùng chỉ để domain/username. */
function ensureHttp(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return 'https://' + url.replace(/^\/+/, '')
}

/** Href cho email/phone (computed để luôn cập nhật) */
const emailHref = computed(() => (contact.value.email ? `mailto:${contact.value.email}` : ''))
const phoneHref = computed(() => {
  const tel = normalizePhoneToTel(contact.value.phone)
  return tel ? `tel:${tel}` : ''
})

/** Danh sách item hiển thị (tự ẩn nếu không có dữ liệu) */
const items = computed(() => {
  const c = contact.value || {}
  return [
    c.email && {
      key: 'email',
      label: 'Email',
      value: c.email,
      href: `mailto:${c.email}`,
      icon: ['fa-solid','fa-envelope'],
      copy: c.email
    },
    c.phone && {
      key: 'phone',
      label: 'Phone',
      value: c.phone,
      href: `tel:${normalizePhoneToTel(c.phone)}`,
      icon: ['fa-solid','fa-phone'],
      copy: c.phone
    },
    c.github && {
      key: 'github',
      label: 'GitHub',
      value: c.github,
      href: ensureHttp(c.github),
      icon: ['fa-brands','fa-github']
    },
    c.linkedin && {
      key: 'linkedin',
      label: 'LinkedIn',
      value: c.linkedin,
      href: ensureHttp(c.linkedin),
      icon: ['fa-brands','fa-linkedin']
    },
    c.website && {
      key: 'website',
      label: 'Website',
      value: c.website,
      href: ensureHttp(c.website),
      icon: ['fa-solid','fa-globe']
    }
  ].filter(Boolean)
})

/** Copy tiện dụng */
const copiedKey = ref('')
async function copy(value, key) {
  try {
    await navigator.clipboard.writeText(value)
    copiedKey.value = key
    setTimeout(() => (copiedKey.value = ''), 1500)
  } catch (e) {
    // bỏ qua im lặng
  }
}
</script>

<template>
  <div class="container">
    <SectionTitle title="Contact">
      <div class="contact-card">
        <template v-if="items.length">
          <div
              v-for="it in items"
              :key="it.key"
              class="row"
          >
            <div class="left">
              <i :class="it.icon.join(' ')" aria-hidden="true"></i>
              <strong>{{ it.label }}</strong>
            </div>

            <div class="right">
              <a v-if="it.href" :href="it.href" target="_blank" rel="noopener">
                {{ it.value }}
              </a>
              <span v-else>{{ it.value }}</span>

              <button
                  v-if="it.copy"
                  class="copy"
                  :aria-label="`Copy ${it.label}`"
                  @click="copy(it.copy, it.key)"
                  title="Copy"
              >
                <i v-if="copiedKey !== it.key" class="fa-solid fa-copy"></i>
                <i v-else class="fa-solid fa-check"></i>
              </button>
            </div>
          </div>
        </template>

        <p v-else class="muted">Chưa có thông tin liên hệ.</p>

        <!-- CTA nhanh -->
        <div class="cta">
          <a v-if="emailHref" :href="emailHref" class="btn primary">
            <i class="fa-solid fa-envelope"></i> Email me
          </a>
          <a v-if="phoneHref" :href="phoneHref" class="btn">
            <i class="fa-solid fa-phone"></i> Call me
          </a>
        </div>
      </div>
    </SectionTitle>
  </div>
</template>

<style scoped>
.contact-card{
  display:grid; gap:.75rem;
  background: rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.10);
  border-radius:16px; padding:1rem;
}

/* hàng */
.row{
  display:flex; align-items:center; justify-content:space-between;
  gap:.75rem; padding:.5rem .25rem;
  border-bottom:1px dashed rgba(255,255,255,.10);
}
.row:last-child{ border-bottom:0 }

.left{ display:flex; align-items:center; gap:.5rem; color:#cbd5e1 }
.left i{ color:#22d3ee }

.right{
  display:flex; align-items:center; gap:.5rem; flex-wrap:wrap;
}
.right a{
  color:#e5e7eb; text-decoration:none; border-bottom:1px dotted rgba(255,255,255,.25);
}
.right a:hover{ border-color:#22d3ee66 }

.copy{
  display:inline-flex; align-items:center; justify-content:center;
  width:32px; height:32px; border-radius:8px; cursor:pointer;
  background:rgba(2,6,23,.6); border:1px solid rgba(255,255,255,.15); color:#e5e7eb;
}
.copy:hover{ border-color:#22d3ee66 }

/* CTA */
.cta{
  display:flex; gap:.5rem; flex-wrap:wrap; margin-top:.25rem;
}
.btn{
  padding:.5rem .75rem; border-radius:10px; border:1px solid #334155;
  background:#0b1224; color:#e5e7eb; text-decoration:none; font-weight:600;
  display:inline-flex; align-items:center; gap:.4rem;
}
.btn.primary{ background:#22d3ee; border-color:#22d3ee; color:#0f172a }
.btn:hover{ border-color:#475569 }

.muted{ color:#a3a7b3 }
</style>
