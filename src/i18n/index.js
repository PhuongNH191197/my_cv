// src/i18n/index.js (biến thể)
import { createI18n } from 'vue-i18n'
const FALLBACK = 'en'
const saved = localStorage.getItem('locale')
const browser = navigator.language?.startsWith('vi') ? 'vi' : 'en'
export const locale = saved || browser || FALLBACK

const i18n = createI18n({ legacy:false, globalInjection:true, locale, fallbackLocale: FALLBACK, messages:{} })

const loaded = new Set()

export async function loadLocale(lang) {
    if (loaded.has(lang)) return
    const messages = await import(`../locales/${lang}.json`)
    i18n.global.setLocaleMessage(lang, messages.default)
    loaded.add(lang)
}

export async function setLocale(lang) {
    await loadLocale(lang)
    i18n.global.locale.value = lang
    localStorage.setItem('locale', lang)
    document.documentElement.lang = lang
}

// khởi tạo mặc định (Xóa await ở đây để tránh lỗi build, sẽ gọi ở main.js)
// await loadLocale(locale)
export default i18n
