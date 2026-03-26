<script setup>
import { ref, computed, onMounted, watch } from 'vue'

import SectionTitle from '@/components/SectionTitle.vue'
import { useResumeStore } from '@/stores/resume.store'

import { usePostsStore } from '@/stores/posts.store'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'
import StarRating from '@/components/StarRating.vue'
import ImageMosaic from '@/components/ImageMosaic.vue'

dayjs.extend(relativeTime)

const resumeStore = useResumeStore()
const profile = computed(() => resumeStore.resume?.profile || {})
onMounted(async () => {
  await resumeStore.load()
  await store.load() // (posts)

  console.log('Loaded resume:', profile)
})

const { locale, t } = useI18n()
watch(locale, (lang) => dayjs.locale(lang || 'en'), { immediate: true })

const store = usePostsStore()
onMounted(() => { store.load() })

const TAB_ALL = 'all'
const filter = ref(TAB_ALL)
const filteredPosts = computed(() => {
  const list = store.ordered
  if (filter.value === 'photos') return list.filter(p => p.images?.length)
  if (filter.value === 'liked') return list.filter(p => p.liked)
  if (['soccer','pickleball','charity','teambuilding'].includes(filter.value))
    return list.filter(p => p.activity === filter.value)
  return list
})

// dưới các import/hàm khác
const READ_LIMIT = 220
const expanded = ref(new Set())

function isExpanded(id) {
  return expanded.value.has(id)
}
function toggleExpand(id) {
  const s = new Set(expanded.value)
  s.has(id) ? s.delete(id) : s.add(id)
  expanded.value = s
}
function displayText(p) {
  const txt = p?.text || ''
  if (isExpanded(p.id) || txt.length <= READ_LIMIT) return txt
  return txt.slice(0, READ_LIMIT).trim() + '…'
}
function isTooLong(p) {
  return (p?.text?.length || 0) > READ_LIMIT
}

const text = ref('')
const files = ref([])
const fileInput = ref(null)
const activity = ref('other')
const place = ref('')
const when = ref(new Date(Date.now() - new Date().getTimezoneOffset()*60000).toISOString().slice(0,16))

function onPickFiles(e){ files.value = Array.from(e.target.files || []) }
function filesToDataUrls(list){
  const readers = list.map(f => new Promise((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f)
  }))
  return Promise.all(readers)
}
async function publish(){
  if (!text.value.trim() && files.value.length === 0) return
  const images = await filesToDataUrls(files.value)
  store.add({
    text: text.value.trim(),
    images,
    author: resume.profile.name,
    activity: activity.value,
    place: place.value.trim(),
    when: when.value
  })
  text.value=''; files.value=[]; place.value=''; activity.value='other'
  if (fileInput.value) fileInput.value.value=''
}

function actIcon(a){
  return {
    soccer: 'fa-solid fa-futbol',
    pickleball: 'fa-solid fa-table-tennis-paddle-ball',
    charity: 'fa-solid fa-hand-holding-heart',
    teambuilding: 'fa-solid fa-people-group',
    other: 'fa-solid fa-note-sticky'
  }[a || 'other']
}

const labels = computed(() => [
  t('rating.terrible'), t('rating.bad'), t('rating.ok'),
  t('rating.good'), t('rating.excellent')
])
</script>

<template>
  <div class="home-view">
    <div class="container">
      <div class="composer card" style="display:none;">
        <div class="composer-head">
          <div class="avatar">
            <img v-if="profile.avatar" :src="profile.avatar" alt="avatar" @error="e => e.target.style.display='none'" />
            <span v-else>{{ profile.name?.at(0) || 'U' }}</span>
          </div>
          <div class="who">
            <strong>{{ profile.name }}</strong>
            <small class="muted">{{ profile.title }}</small>
          </div>
        </div>

        <textarea v-model="text" :placeholder="t('post.placeholder')" rows="3"></textarea>

        <div class="meta-line">
          <select v-model="activity" class="select">
            <option value="other">{{ t('activities.other') }}</option>
            <option value="soccer">{{ t('activities.soccer') }}</option>
            <option value="pickleball">{{ t('activities.pickleball') }}</option>
            <option value="charity">{{ t('activities.charity') }}</option>
            <option value="teambuilding">{{ t('activities.teambuilding') }}</option>
          </select>
          <input v-model="place" class="input" :placeholder="t('post.placePlaceholder')" />
          <input v-model="when" type="datetime-local" class="input" />
        </div>

        <div class="previews" v-if="files.length">
          <img v-for="(f, i) in files" :key="i" :src="URL.createObjectURL(f)" :alt="`preview-${i}`" />
        </div>

        <div class="composer-actions">
          <label class="btn outline">
            <i class="fa-solid fa-image"></i>
            <input ref="fileInput" type="file" accept="image/*" multiple @change="onPickFiles" />
            {{ t('post.addPhotos') }}
          </label>
          <button class="btn" :disabled="!text.trim() && files.length===0" @click="publish">
            <i class="fa-solid fa-paper-plane"></i> {{ t('post.publish') }}
          </button>
        </div>
      </div>

      <div class="chips">
        <button :class="['chip', {active: filter===TAB_ALL}]" @click="filter=TAB_ALL">{{ t('feed.all') }}</button>
        <button :class="['chip', {active: filter==='soccer'}]" @click="filter='soccer'"><i class="fa-solid fa-futbol"></i> {{ t('activities.soccer') }}</button>
        <button :class="['chip', {active: filter==='pickleball'}]" @click="filter='pickleball'"><i class="fa-solid fa-table-tennis-paddle-ball"></i> {{ t('activities.pickleball') }}</button>
        <button :class="['chip', {active: filter==='charity'}]" @click="filter='charity'"><i class="fa-solid fa-hand-holding-heart"></i> {{ t('activities.charity') }}</button>
        <button :class="['chip', {active: filter==='teambuilding'}]" @click="filter='teambuilding'"><i class="fa-solid fa-people-group"></i> {{ t('activities.teambuilding') }}</button>
        <span class="spacer"></span>
        <button :class="['chip', {active: filter==='photos'}]" @click="filter='photos'"><i class="fa-solid fa-images"></i> {{ t('feed.photos') }}</button>
        <button :class="['chip', {active: filter==='liked'}]" @click="filter='liked'"><i class="fa-solid fa-thumbs-up"></i> {{ t('feed.liked') }}</button>
      </div>

      <SectionTitle :title="t('post.feedTitle')" />
      <div class="feed">
        <article class="post card" v-for="p in filteredPosts" :key="p.id">
          <header class="post-head">
            <div class="avatar small">
              <img v-if="profile.avatar && (p.author === profile.name || !p.author)" :src="profile.avatar" alt="avatar" @error="e => e.target.style.display='none'" />
              <span v-else>{{ (p.author || '?').at(0) }}</span>
            </div>
            <div class="who text-truncate">
              <strong :title="p.author">{{ p.author }}</strong>
              <small class="muted" style="margin-top: 10px;">
                <span class="badge" :class="'b-'+p.activity">
                  <i :class="actIcon(p.activity)"></i> {{ t(`activities.${p.activity}`) }}
                </span>
                <i class="fa-solid fa-location-dot"></i>
                <span :title="p.place" class="text-truncate">{{ p.place }}</span>
                <span> · {{ p.when }}</span>
              </small>
            </div>
          </header>

          <p class="text" v-if="p.text">
            {{ displayText(p) }}
            <button
                v-if="isTooLong(p)"
                class="link-inline"
                @click="toggleExpand(p.id)"
            >
              {{ isExpanded(p.id) ? t('common.readLess') : t('common.readMore') }}
            </button>
          </p>

          <!-- ...trong template của mỗi post -->
          <ImageMosaic :images="p.images" :max="5" />
  <!--        <div class="images" v-if="p.images?.length">-->
  <!--          <img v-for="(src, i) in p.images" :key="i" :src="src" :alt="`img-${i}`" />-->
  <!--        </div>-->

          <footer class="actions">
            <StarRating v-model="p.rating" :labels="labels" :size="20" @change="store.persist()" />
          </footer>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.composer { display: grid; gap: 1rem; margin-bottom: 2.5rem; }
.composer-head { display: flex; align-items: center; gap: 1rem; }
.avatar {
  width: 48px; height: 48px; border-radius: 50%;
  background: var(--surface); color: var(--fg);
  display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--glass-border); font-weight: 800; font-family: var(--font-serif);
  overflow: hidden; flex-shrink: 0;
}
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.avatar.small { width: 40px; height: 40px; font-size: 0.9rem; }

.composer textarea {
  width: 100%; background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--glass-border); border-radius: var(--radius-md);
  color: var(--fg); padding: 1rem; outline: none; font-family: var(--font-sans); resize: none;
}
.composer textarea:focus { border-color: var(--primary); }

.meta-line { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.select, .input {
  background: rgba(0, 0, 0, 0.2); color: var(--fg);
  border: 1px solid var(--glass-border); border-radius: 10px; padding: 0.6rem 0.85rem;
  outline: none;
}
.input:focus, .select:focus { border-color: var(--primary); }

.chips { display: flex; gap: 0.65rem; flex-wrap: wrap; align-items: center; margin: 2rem 0; }
.chip {
  padding: 0.45rem 1rem; border-radius: 999px;
  border: 1px solid var(--glass-border); background: rgba(255,255,255,0.03);
  color: var(--muted); cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem;
  font-weight: 500; font-size: 0.9rem; transition: var(--transition-smooth);
}
.chip i { font-size: 0.85rem; }
.chip:hover { border-color: var(--primary); color: var(--primary); }
.chip.active { background: var(--primary); color: #0b1220; border-color: var(--primary); font-weight: 700; box-shadow: 0 0 15px var(--primary-glow); }

.feed { display: grid; gap: 1.5rem; }
.post { padding: 1.5rem; }
.post-head { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1rem; }
.post-head .who strong { font-size: 1.1rem; }
.post-head .who small { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-top: 0.25rem; }

.post .text { margin: 0.5rem 0 1rem; line-height: 1.8; color: var(--fg); font-size: 1.05rem; }

.actions { display: flex; justify-content: flex-end; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px dashed var(--glass-border); }

.badge {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.25rem 0.65rem; border-radius: 999px;
  font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
}

.link-inline { background: transparent; border: 0; color: var(--primary); cursor: pointer; font-weight: 600; padding: 0 0.25rem; }
.link-inline:hover { text-decoration: underline; }

@media (max-width: 640px) {
  .meta-line { flex-direction: column; }
  .select, .input { width: 100%; }
}
</style>
