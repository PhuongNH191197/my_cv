<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useResumeStore } from '@/stores/resume.store'

const { t, locale } = useI18n()
const resumeStore = useResumeStore()

const open = ref(false)
const showBubble = ref(false)
const input = ref('')
const messages = ref([]) // {role:'assistant'|'user', text:string}
const box = ref(null)

// trạng thái gọi AI & controller để có thể hủy request trước đó
const pendingAI = ref(false)
let aiController = null

const name = computed(() => resumeStore.resume?.profile?.name || 'User')
const title = computed(() => resumeStore.resume?.profile?.title || '')
const locationStr = computed(() => resumeStore.resume?.profile?.location || '')
const skills = computed(() => (resumeStore.resume?.skills || []).slice(0, 10))
const projects = computed(() => (resumeStore.resume?.projects || []).slice(0, 5))
const summary = computed(() => resumeStore.resume?.profile?.summary || '')

function push(role, text) {
  messages.value.push({ role, text })
  nextTick(() => {
    const sc = box.value?.querySelector('.chat-scroll')
    if (sc) sc.scrollTop = sc.scrollHeight
  })
  sessionStorage.setItem('ai_chat_history', JSON.stringify(messages.value))
}

function greetAssistant() {
  const greet = t('assistant.greeting', { name: name.value })
  push('assistant', greet + '\n' + t('assistant.suggest'))
}

function toggleOpen() {
  open.value = !open.value
  if (open.value && messages.value.length === 0) greetAssistant()
}

function startChatFromBubble() {
  showBubble.value = false
  open.value = true
  if (messages.value.length === 0) greetAssistant()
}

async function handleSend() {
  const text = input.value.trim()
  if (!text || pendingAI.value) return
  push('user', text)
  input.value = ''
  await answer(text)
}

async function answer(q) {
  const ql = q.toLowerCase()
  const nq = ql.normalize("NFD").replace(/[\u0300-\u036f]/g, "") // bỏ dấu để tìm kiếm mềm hơn

  // 1. Hỏi về Dự án
  const projects = resumeStore.resume?.projects || []
  const foundProject = projects.find(p => {
    const pName = (p.name || '').toLowerCase()
    const pId = (p.id || '').replace(/-/g, ' ').toLowerCase()
    return ql.includes(pName) || nq.includes(pName) || ql.includes(pId)
  })

  if (foundProject) {
    const tech = foundProject.tech?.join(', ') || ''
    const msg = `**Dự án: ${foundProject.name}**\n\n${foundProject.summary}\n\n🛠 **Công nghệ**: ${tech}`
    push('assistant', msg)
    return
  }

  // 2. Hỏi về Hoạt động (Post)
  const posts = resumeStore.posts || []
  const foundPost = posts.find(p => {
    // Tìm theo activity hoặc keyword trong text
    const act = (p.activity || '').toLowerCase()
    const txt = (p.text || '').toLowerCase()
    return (act && (ql.includes(act) || nq.includes(act))) || (txt && txt.includes(ql))
  })

  if (foundPost) {
    const msg = `**Hoạt động: ${foundPost.activity || 'Hoạt động'}**\n\n${foundPost.text}\n\n📅 ${foundPost.when}`
    push('assistant', msg)
    return
  }

  // 3. Intent cơ bản (Công việc, kỹ năng, ...)
  if (/(công việc|job|work|kinh nghiệm|experience)/i.test(ql) || /(làm gì|who are you|bạn là ai)/i.test(ql)) {
    push('assistant', t('assistant.aboutWork', { title: title.value, location: locationStr.value }) + `\n\n${summary.value}`)
    return
  }
  if (/(kỹ năng|ky nang|skill|skills|tech|công nghệ)/i.test(ql)) {
    const list = skills.value.length ? skills.value.join(', ') : t('assistant.noData')
    push('assistant', t('assistant.aboutSkills', { skills: list }))
    return
  }
  if (/(dự án|du an|project)/i.test(ql)) {
    // Liệt kê tên các dự án
    const list = projects.length
        ? projects.map(p => `• ${p.name}`).join('\n')
        : t('assistant.noData')
    push('assistant', t('assistant.aboutProjects') + '\n' + list + '\n\n(Bạn có thể hỏi chi tiết về từng dự án nhé!)')
    return
  }
  if (/(liên hệ|contact|email|phone|sdt|số điện thoại)/i.test(ql)) {
    const contact = resumeStore.resume?.contact
    const lines = []
    if (contact?.email) lines.push(`✉️ ${contact.email}`)
    if (contact?.phone) lines.push(`📞 ${contact.phone}`)
    if (contact?.website) lines.push(`🌐 ${contact.website}`)
    if (contact?.github && contact.github !== '***') lines.push(`GitHub: ${contact.github}`)
    if (contact?.linkedin && contact.linkedin !== '***') lines.push(`LinkedIn: ${contact.linkedin}`)
    
    if (!lines.length) lines.push(t('assistant.noData'))
    push('assistant', t('assistant.contact') + '\n' + lines.join('\n'))
    return
  }

  // 4. Gọi backend AI nếu không khớp intent nào ở trên
  try {
    pendingAI.value = true
    if (aiController) aiController.abort() // Hủy request cũ
    aiController = new AbortController()

    const payload = {
      messages: messages.value.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        text: m.text
      })),
      locale: locale.value,
      profile: {
        name: name.value,
        title: title.value,
        location: locationStr.value,
        summary: summary.value
      }
    }

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: aiController.signal
    })

    if (!res.ok) throw new Error('API Error')
    const { reply } = await res.json()
    if (reply) push('assistant', reply)
    else throw new Error('Empty reply')
  } catch (e) {
    if (e.name === 'AbortError') return
    console.error('[AI Assistant] backend error:', e)
    
    // Fallback: Nếu backend lỗi, dùng câu trả lời tĩnh có sẵn
    const contact = resumeStore.resume?.contact || {}
    const fallbackMsg = `Xin lỗi, tôi đang gặp chút sự cố kỹ thuật.\n\nBạn vui lòng liên hệ trực tiếp với **${name.value}** để được giải đáp chi tiết nhé:\n✉️ ${contact.email || '...'}\n📞 ${contact.phone || '...'}`
    push('assistant', fallbackMsg)
  } finally {
    pendingAI.value = false
    aiController = null
  }
}

onMounted(async () => {
  if (!resumeStore.resume?.profile) await resumeStore.load()

  // Khôi phục lịch sử chat (1 session)
  const saved = sessionStorage.getItem('ai_chat_history')
  if (saved) {
    try { messages.value = JSON.parse(saved) || [] } catch { /* noop */ }
  }

  // Bong bóng chào 1 lần mỗi session
  if (!sessionStorage.getItem('ai_greeted')) {
    showBubble.value = true
    sessionStorage.setItem('ai_greeted', '1')
  }
})

// Đổi ngôn ngữ: nếu hộp chat mở & chưa có tin nhắn → phát chào
watch(locale, () => {
  if (open.value && messages.value.length === 0) greetAssistant()
})
</script>

<template>
  <!-- Nút chat nổi -->
  <button 
    class="ai-fab glass" 
    :class="{ thinking: pendingAI }" 
    @click="toggleOpen" 
    aria-label="AI Assistant"
    :title="t('assistant.title')"
  >
    <i class="fa-solid fa-comments" v-if="!open"></i>
    <i class="fa-solid fa-xmark" v-else></i>
  </button>

  <!-- Chat box -->
  <transition name="chat-panel">
    <div v-if="open" class="ai-chat glass" ref="box">
      <header class="ai-chat__header">
        <div class="left">
          <div class="ai-avatar">
            <i class="fa-solid fa-robot"></i>
            <div class="online-pulse"></div>
          </div>
          <div class="header-info">
            <span class="title">{{ t('assistant.title') }}</span>
            <span class="status">{{ pendingAI ? t('assistant.thinking') : 'Online' }}</span>
          </div>
        </div>
        <button class="close-btn" @click="open=false">✕</button>
      </header>

      <div class="chat-scroll">
        <div v-for="(m,i) in messages" :key="i" :class="['msg-wrapper', m.role]">
          <div class="bubble">
            <template v-if="m.role === 'assistant'">
              <div class="bot-icon"><i class="fa-solid fa-robot"></i></div>
            </template>
            <div class="text" v-text="m.text"></div>
          </div>
        </div>
        <div v-if="pendingAI" class="msg-wrapper assistant">
          <div class="bubble thinking">
            <div class="dot"></div><div class="dot"></div><div class="dot"></div>
          </div>
        </div>
      </div>

      <form class="ai-chat__input" @submit.prevent="handleSend">
        <input
            :placeholder="t('assistant.placeholder')"
            v-model="input"
            autocomplete="off"
            :disabled="pendingAI"
        />
        <button class="send-btn" type="submit" :disabled="pendingAI || !input.trim()">
          <i class="fa-solid fa-paper-plane"></i>
        </button>
      </form>
    </div>
  </transition>
</template>

<style scoped>
/* greeting bubble */
.ai-bubble {
  position: fixed; right: 90px; bottom: 100px; z-index: 1000;
  background: var(--surface); color: var(--fg);
  border: 1px solid var(--glass-border); border-radius: 16px;
  padding: 1rem; max-width: 280px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.4);
  backdrop-filter: blur(12px);
  animation: float 3s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.ai-bubble__btn {
  margin-top: 0.75rem; width: 100%;
  background: var(--primary); color: #0b1220; border: 0;
  padding: 0.5rem; border-radius: 10px; font-weight: 700; cursor: pointer;
}

/* fab */
.ai-fab {
  position: fixed; right: 28px; bottom: 28px; z-index: 1001;
  width: 64px; height: 64px; border-radius: 50%;
  background: linear-gradient(135deg, #22d3ee, #a78bfa);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 12px 40px rgba(34, 211, 238, 0.4);
  cursor: pointer;
  border: 2px solid rgba(255,255,255,0.2);
  font-size: 1.6rem;
  animation: fab-float 4s ease-in-out infinite;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.ai-fab.thinking {
  animation: fab-breathe 1.5s ease-in-out infinite;
  box-shadow: 0 0 30px var(--primary);
}
@keyframes fab-float {
  0%, 100% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-8px) rotate(5deg); }
}
@keyframes fab-breathe {
  0%, 100% { transform: scale(1); box-shadow: 0 0 10px var(--primary-glow); }
  50% { transform: scale(1.1); box-shadow: 0 0 30px var(--primary); }
}
.ai-fab:hover { transform: scale(1.15) rotate(10deg); }

/* chat box */
.ai-chat {
  position: fixed; right: 24px; bottom: 95px; z-index: 1002;
  width: 380px; max-width: calc(100vw - 48px); height: 65vh; max-height: 580px;
  border-radius: 24px; display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 24px 64px rgba(0,0,0,0.6);
}

.ai-chat__header {
  padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between;
  background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--glass-border);
}
.ai-chat__header .left { display: flex; gap: 0.85rem; align-items: center; }
.ai-avatar { position: relative; width: 40px; height: 40px; background: rgba(34, 211, 238, 0.15); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--primary); font-size: 1.2rem; }
.online-pulse { position: absolute; bottom: -2px; right: -2px; width: 10px; height: 10px; background: #10b981; border-radius: 50%; border: 2px solid var(--surface); }
.header-info { display: flex; flex-direction: column; }
.header-info .title { font-weight: 800; font-family: var(--font-serif); font-size: 1rem; }
.header-info .status { font-size: 0.75rem; color: var(--muted); }
.close-btn { background: transparent; border: 0; color: var(--muted); cursor: pointer; font-size: 1.2rem; }

.chat-scroll { flex: 1; overflow: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }

.msg-wrapper { display: flex; width: 100%; }
.msg-wrapper.user { justify-content: flex-end; }

.bubble { max-width: 85%; padding: 0.75rem 1rem; border-radius: 18px; position: relative; font-size: 0.95rem; }
.user .bubble { background: var(--primary); color: #0b1220; border-bottom-right-radius: 4px; font-weight: 500; }
.assistant .bubble { background: rgba(255,255,255,0.05); color: var(--fg); border-bottom-left-radius: 4px; border: 1px solid var(--glass-border); display: flex; gap: 0.75rem; }
.bot-icon { margin-top: 2px; color: var(--primary); font-size: 0.9rem; }

/* Thinking dots */
.thinking { display: flex; gap: 4px; padding: 0.85rem 1rem !important; }
.dot { width: 6px; height: 6px; background: var(--muted); border-radius: 50%; animation: pulse 1.4s infinite; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.1); } }

.ai-chat__input { padding: 1rem; display: flex; gap: 0.75rem; background: rgba(255,255,255,0.02); border-top: 1px solid var(--glass-border); }
.ai-chat__input input { flex: 1; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 14px; padding: 0.75rem 1rem; color: var(--fg); outline: none; font-size: 16px; }
.ai-chat__input input:focus { border-color: var(--primary); }
.send-btn { width: 46px; height: 46px; border-radius: 12px; background: var(--primary); color: #0b1220; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
.send-btn:disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(1); }

/* transitions */
.chat-panel-enter-active, .chat-panel-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.chat-panel-enter-from, .chat-panel-leave-to { transform: translateY(30px) scale(0.95); opacity: 0; }

@media (max-width: 640px) {
  .ai-chat { right: 12px; bottom: 84px; width: calc(100vw - 24px); height: 70vh; }
  .ai-bubble { right: 80px; bottom: 90px; }
}
</style>
