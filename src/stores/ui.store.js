import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    dark: JSON.parse(localStorage.getItem('dark') || 'true'),
  }),
  actions: {
    toggleDark() {
      this.dark = !this.dark
      localStorage.setItem('dark', JSON.stringify(this.dark))
      document.documentElement.style.background = this.dark ? '#0b1020' : '#ffffff'
      document.body.style.background = this.dark ? '#0b1020' : '#ffffff'
      document.body.style.color = this.dark ? '#e2e8f0' : '#111827'
    },
    initTheme() {
      document.documentElement.style.background = this.dark ? '#0b1020' : '#ffffff'
      document.body.style.background = this.dark ? '#0b1020' : '#ffffff'
      document.body.style.color = this.dark ? '#e2e8f0' : '#111827'
    }
  }
})
