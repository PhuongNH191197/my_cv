<!-- src/components/Navbar.vue -->
<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import LangSwitcher from '@/components/LangSwitcher.vue'
import LoginModal from '@/components/modal/LoginModal.vue'

/* ---------------- State tổng ---------------- */
const isOpen = ref(false)          // drawer mobile
const isLoginOpen = ref(false)     // modal login

// Chặn scroll khi mở drawer hoặc modal
watch([isOpen, isLoginOpen], ([drawer, login]) => {
  document.body.style.overflow = (drawer || login) ? 'hidden' : ''
})

/* ---------------- Swipe mở/đóng drawer (giữ nguyên) ---------------- */
let startX = 0, startY = 0
const onEdgeStart = (e) => { const t = e.touches?.[0]; if (!t) return; startX=t.clientX; startY=t.clientY }
const onEdgeMove  = (e) => {
  const t = e.touches?.[0]; if (!t) return
  const dx = t.clientX - startX, dy = Math.abs(t.clientY - startY)
  if (dy > 30) return
  if (startX <= 24 && dx > 60) isOpen.value = true
}
const onEdgeEnd = () => {}

let dStartX = 0, dStartY = 0
const onDrawerStart = (e) => { const t=e.touches?.[0]; if(!t) return; dStartX=t.clientX; dStartY=t.clientY }
const onDrawerMove  = (e) => {
  const t = e.touches?.[0]; if (!t) return
  const dx = t.clientX - dStartX, dy = Math.abs(t.clientY - dStartY)
  if (dy > 30) return
  if (dx < -60) isOpen.value = false
}

const handleResize = () => { if (window.innerWidth >= 768) isOpen.value = false }
onMounted(() => window.addEventListener('resize', handleResize))
onBeforeUnmount(() => window.removeEventListener('resize', handleResize))

/* ---------------- Auth (hard-code) ---------------- */
const SESSION_KEY = 'mycv_session'
const user = ref(null) // { username, name, avatar? }
const isLoggedIn = computed(() => !!user.value)
const userInitial = computed(() =>
    (user.value?.name || user.value?.username || '?').charAt(0).toUpperCase()
)

onMounted(() => {
  const raw = localStorage.getItem(SESSION_KEY)
  if (raw) {
    try { user.value = JSON.parse(raw) } catch {}
  }
})

function saveSession(u){
  user.value = u
  localStorage.setItem(SESSION_KEY, JSON.stringify(u))
}
function clearSession(){
  user.value = null
  localStorage.removeItem(SESSION_KEY)
}

/* ---------------- Toast mini ---------------- */
const toast = ref({ show:false, type:'success', msg:'' })
let toastTimer
function notify(msg, type='success'){
  toast.value = { show:true, type, msg }
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value.show = false), 2200)
}

/* ---------------- Login handler (hard-code) ---------------- */
// Submit login (nối API sau)
function onLogin({ username, password, remember }){
  // HARD-CODE:
  if (username === 'admin' && password === '123456') {
    saveSession({
      username: 'admin',
      name: 'Admin',
      // Có thể dùng avatar thật nếu bạn có: thay bằng URL ảnh
      avatar: '' // để trống sẽ hiển thị chữ cái đầu
    })
    isLoginOpen.value = false
    notify('Đăng nhập thành công!', 'success')
  } else {
    notify('Sai username/password. Vui lòng thử lại.', 'error')
  }
}

/* ---------------- Dropdown avatar ---------------- */
const menuOpen = ref(false)
function toggleMenu(){ menuOpen.value = !menuOpen.value }
function logout(){
  clearSession()
  menuOpen.value = false
  notify('Đã đăng xuất.', 'success')
}

// Đóng dropdown khi click ra ngoài
function onDocClick(e){
  const el = e.target
  if (!el.closest('.user-menu')) menuOpen.value = false
}
onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <!-- Toast -->
  <div v-if="toast.show" class="toast" :class="toast.type">
    <i v-if="toast.type==='success'" class="fa-solid fa-circle-check"></i>
    <i v-else class="fa-solid fa-triangle-exclamation"></i>
    <span>{{ toast.msg }}</span>
  </div>

  <nav class="navbar glass" :class="{ 'drawer-open': isOpen }">
    <div class="navbar-inner container">
      <!-- Logo -->
      <RouterLink to="/" class="brand" aria-label="Home">
        <i class="fa-brands fa-pied-piper-alt"></i> IamFhug
      </RouterLink>

      <!-- Menu ngang -->
      <ul class="nav-desktop">
        <li><RouterLink to="/" class="link">{{ $t('nav.home') }}</RouterLink></li>
        <li><RouterLink to="/about" class="link">{{ $t('nav.about') }}</RouterLink></li>
        <li><RouterLink to="/skills" class="link">{{ $t('nav.skills') }}</RouterLink></li>
        <li><RouterLink to="/projects" class="link">{{ $t('nav.projects') }}</RouterLink></li>
        
        <li class="lang"><LangSwitcher /></li>

        <li>
          <RouterLink to="/contact" class="btn primary">
            <i class="fa-solid fa-envelope"></i><span>{{ $t('nav.contact') }}</span>
          </RouterLink>
        </li>

        <!-- Nút Login / Avatar -->
        <li v-if="!isLoggedIn">
          <button class="btn secondary" @click="isLoginOpen = true">
            <i class="fa-solid fa-right-to-bracket"></i>
            <span>Login</span>
          </button>
        </li>

        <li v-else class="user-menu">
          <button class="avatar-btn glass" @click="toggleMenu" aria-haspopup="menu" :aria-expanded="menuOpen">
            <img v-if="user?.avatar" :src="user.avatar" alt="avatar" />
            <span v-else class="avatar-fallback">{{ userInitial }}</span>
            <i class="fa-solid fa-chevron-down chevron" />
          </button>
          <transition name="menu">
            <div v-if="menuOpen" class="dropdown glass" role="menu">
              <div class="profile-header">
                <div class="pic">
                  <img v-if="user?.avatar" :src="user.avatar" alt="avatar" />
                  <span v-else>{{ userInitial }}</span>
                </div>
                <div class="meta">
                  <strong>{{ user?.name || user?.username }}</strong>
                  <small>{{ user?.username }}</small>
                </div>
              </div>
              <RouterLink to="/profile" class="dropdown-item" @click="menuOpen=false">
                <i class="fa-regular fa-user"></i> Hồ sơ
              </RouterLink>
              <button class="dropdown-item danger" @click="logout">
                <i class="fa-solid fa-arrow-right-from-bracket"></i> Đăng xuất
              </button>
            </div>
          </transition>
        </li>
      </ul>

      <!-- Hamburger cho mobile -->
      <button class="hamburger" aria-label="Open menu" @click="isOpen = true">
        <span></span><span></span><span></span>
      </button>
    </div>

    <!-- Mobile Drawer -->
    <transition name="fade">
      <div v-if="isOpen" class="overlay" @click="isOpen = false" />
    </transition>
    <transition name="slide-left">
      <div v-if="isOpen" class="drawer">
        <div class="drawer-head">
          <RouterLink to="/" class="brand" @click="isOpen = false">IamFhug</RouterLink>
          <button class="close-btn" @click="isOpen = false">&times;</button>
        </div>
        
        <nav class="drawer-nav">
          <RouterLink to="/" class="link" @click="isOpen = false">{{ $t('nav.home') }}</RouterLink>
          <RouterLink to="/about" class="link" @click="isOpen = false">{{ $t('nav.about') }}</RouterLink>
          <RouterLink to="/skills" class="link" @click="isOpen = false">{{ $t('nav.skills') }}</RouterLink>
          <RouterLink to="/projects" class="link" @click="isOpen = false">{{ $t('nav.projects') }}</RouterLink>
          <RouterLink to="/contact" class="btn primary" @click="isOpen = false">
            <i class="fa-solid fa-envelope"></i> {{ $t('nav.contact') }}
          </RouterLink>
        </nav>

        <div class="drawer-footer">
          <LangSwitcher />
          
          <button v-if="!isLoggedIn" class="btn secondary full" @click="isLoginOpen = true; isOpen = false">
            <i class="fa-solid fa-right-to-bracket"></i> Login
          </button>
          
          <div v-else class="drawer-profile" @click="isOpen = false">
             <div class="pic">
                <img v-if="user?.avatar" :src="user.avatar" alt="avatar" />
                <span v-else>{{ userInitial }}</span>
             </div>
             <div class="meta text-truncate">
                <strong class="text-truncate" :title="user?.name">{{ user?.name }}</strong>
                <small class="text-truncate" :title="'@' + user?.username">@{{ user?.username }}</small>
             </div>
          </div>
        </div>
      </div>
    </transition>
  </nav>

  <LoginModal 
    v-if="isLoginOpen" 
    @close="isLoginOpen = false" 
    @login="onLogin"
  />
</template>

<style scoped>
/* ===== Toast ===== */
.toast{
  position: fixed; bottom: 85px; right: 24px; z-index: 9999;
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem 1.25rem; border-radius: 14px;
  background: var(--surface); color: var(--fg);
  border: 1px solid var(--glass-border);
  box-shadow: 0 10px 40px rgba(0,0,0,0.4);
  backdrop-filter: blur(12px);
  animation: slideInUp 0.3s ease;
}
@keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } }
.toast.success{ border-color: rgba(16, 185, 129, 0.3) }
.toast.error  { border-color: rgba(239, 68, 68, 0.3); color: #fca5a5 }

/* Hamburger */
.hamburger{ display: flex; flex-direction: column; gap: 5px; border: 0; background: transparent; padding: 0.5rem; cursor: pointer }
.hamburger span{ width: 24px; height: 2px; background: var(--fg); border-radius: 2px; }

/* Desktop Menu */
.nav-desktop { display: none; list-style: none; margin: 0; padding: 0; align-items: center; gap: 1.25rem; }
.link { text-decoration: none; color: var(--fg); font-weight: 500; font-size: 1rem; padding: 0.5rem; position: relative; }
.link:hover { color: var(--primary); }
.link::after { content: ''; position: absolute; bottom: 0; left: 0.5rem; right: 0.5rem; height: 2px; background: var(--primary); transform: scaleX(0); transition: var(--transition-smooth); }
.router-link-active.link::after { transform: scaleX(1); }

.lang { margin: 0 0.5rem; }

@media (max-width: 767px) {
  .navbar { background: #0f172a !important; backdrop-filter: none !important; }
}

/* User Menu & Dropdown */
.user-menu { position: relative; }
.avatar-btn {
  display: flex; align-items: center; gap: 0.5rem;
  background: rgba(255,255,255,0.06); border: 1px solid var(--glass-border);
  border-radius: var(--radius-md); 
  padding: 0.35rem 0.75rem 0.35rem 0.35rem; 
  color: var(--fg); cursor: pointer;
  transition: var(--transition-smooth);
}
.avatar-btn img { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; }
.avatar-fallback { width: 30px; height: 30px; border-radius: 50%; background: var(--primary); color: #0b1220; display: flex; align-items: center; justify-content: center; font-weight: 800; }
.chevron { font-size: 0.75rem; color: var(--muted); }

.dropdown {
  position: absolute; right: 0; top: calc(100% + 12px); min-width: 240px;
  background: var(--surface); border: 1px solid var(--glass-border);
  border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); padding: 0.5rem; z-index: 100;
  backdrop-filter: blur(16px);
}
.profile-header { display: flex; gap: 0.75rem; padding: 0.75rem; border-bottom: 1px solid var(--glass-border); margin-bottom: 0.5rem; }
.profile-header .pic { width: 40px; height: 40px; border-radius: 50%; background: var(--primary); color: #0b1220; display: flex; align-items: center; justify-content: center; font-weight: 800; overflow: hidden; }
.profile-header .pic img { width: 100%; height: 100%; object-fit: cover; }
.profile-header .meta { overflow: hidden; }
.profile-header .meta strong { display: block; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.profile-header .meta small { color: var(--muted); font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }

.dropdown-item {
  width: 100%; text-align: left; display: flex; align-items: center; gap: 0.75rem;
  padding: 0.65rem 0.85rem; border-radius: 10px; background: transparent; color: var(--fg);
  border: 0; cursor: pointer; text-decoration: none; font-weight: 500;
}
.dropdown-item:hover { background: rgba(255,255,255,0.06); color: var(--primary); }
.dropdown-item.danger { color: #fca5a5; }
.dropdown-item.danger:hover { background: rgba(239, 68, 68, 0.1); }

/* Drawer & Overlay */
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 149; backdrop-filter: blur(8px); }
.navbar.drawer-open { z-index: 10000 !important; }

.drawer { 
  position: fixed; top: 0; bottom: 0; left: 0; width: 85%; max-width: 320px; 
  background: #0f172a !important; /* Solid dark color */
  color: var(--fg); border-right: 1px solid var(--glass-border); 
  z-index: 99999 !important; padding: 1.5rem; display: flex; flex-direction: column; gap: 2rem;
  box-shadow: 20px 0 60px rgba(0,0,0,1);
  opacity: 1 !important;
  visibility: visible !important;
}
.drawer-head { display: flex; align-items: center; justify-content: space-between; }
.close-btn { background: transparent; border: 0; color: var(--fg); font-size: 2rem; cursor: pointer; }

.drawer-nav { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1rem; }
.drawer-nav .link { 
  font-size: 1.25rem; font-weight: 600; padding: 0.75rem 1rem; border-radius: 12px;
  background: rgba(255,255,255,0.03);
}
.drawer-nav .link.router-link-active { background: rgba(34, 211, 238, 0.1); color: var(--primary); }

.drawer-footer { margin-top: auto; padding-top: 1.5rem; border-top: 1px solid var(--glass-border); display: flex; flex-direction: column; gap: 1.25rem; }
.drawer-profile { display: flex; align-items: center; gap: 1rem; background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 16px; cursor: pointer; }
.drawer-profile .pic { 
  width: 44px; height: 44px; border-radius: 50%; background: var(--primary); color: #0b1220; 
  display: flex; align-items: center; justify-content: center; font-weight: 800; overflow: hidden; 
}
.drawer-profile .pic img { width: 100%; height: 100%; object-fit: cover; }
.btn.full { width: 100%; }

@media (min-width: 768px) {
  .hamburger { display: none !important; }
  .nav-desktop { display: flex !important; }
}

/* Unify button sizes for balance */
.nav-desktop .btn,
.nav-desktop .avatar-btn,
.nav-desktop .lang-btn {
  height: 42px;
  min-width: 100px;
  justify-content: center;
  padding: 0 1rem;
}

/* ... animations below ... */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-left-enter-active, .slide-left-leave-active { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-left-enter-from, .slide-left-leave-to { transform: translateX(-100%); }
.menu-enter-active, .menu-leave-active { transition: all 0.2s ease; }
.menu-enter-from, .menu-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
