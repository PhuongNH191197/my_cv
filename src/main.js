import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from '@/i18n'
import './assets/main.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

createApp(App)
    .use(createPinia())
    .use(router)
    .use(i18n)
    .mount('#app')
