// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import i18n from '@/i18n'

// Lấy hàm dịch từ i18n (Composition API)
const { t, locale } = i18n.global

// Khai báo route + ánh xạ key i18n cho tiêu đề trang
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { titleKey: 'nav.home' }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { titleKey: 'nav.about' }
  },
  {
    path: '/skills',
    name: 'skills',
    component: () => import('@/views/SkillsView.vue'),
    meta: { titleKey: 'nav.skills' }
  },
  {
    path: '/projects',
    name: 'projects',
    component: () => import('@/views/ProjectsView.vue'),
    meta: { titleKey: 'nav.projects' }
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('@/views/ContactView.vue'),
    meta: { titleKey: 'nav.contact' }
  },
  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: {
      template: `<div class="container section"><h1>404</h1><p class="muted">Page not found</p></div>`
    },
    meta: { titleKey: 'nav.home' } // fallback
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

/**
 * Sau mỗi lần điều hướng:
 * - Đặt document.title theo i18n: "MyCV — {t(meta.titleKey)}"
 * - Cập nhật thẻ <html lang="..."> theo locale hiện tại (en/vi)
 */
router.afterEach((to) => {
  const key = to.meta?.titleKey
  const title = key ? t(key) : 'MyCV'
  document.title = key ? `${title}` : 'MyCV'
  document.documentElement.lang = locale?.value || 'en'
})

export default router
