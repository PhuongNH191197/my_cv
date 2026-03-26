import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n, { loadLocale, locale } from '@/i18n'
import './assets/main.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

async function bootstrap() {
    await loadLocale(locale)
    createApp(App)
        .use(createPinia())
        .use(router)
        .use(i18n)
        .mount('#app')
}

bootstrap()
