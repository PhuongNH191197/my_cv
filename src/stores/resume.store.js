import { defineStore } from 'pinia'

const REMOTE_PATH = 'api/resume.json' // nằm trong public/

function fixUrl(p) {
    if (!p) return p
    if (/^https?:\/\//i.test(p)) return p
    const base = import.meta.env.BASE_URL || '/'
    const clean = p.startsWith('/') ? p.slice(1) : p
    return `${base}${clean}`
}

export const useResumeStore = defineStore('resume', {
    state: () => ({
        resume: {},       // nội dung JSON
        posts: [],        // nội dung post.json
        loading: false,
        error: null
    }),
    actions: {
        async load() {
            this.loading = true
            this.error = null
            try {
                const url = `${import.meta.env.BASE_URL}${REMOTE_PATH}?cb=${Date.now()}`
                const postUrl = `${import.meta.env.BASE_URL}api/post.json?cb=${Date.now()}`

                const [resResume, resPost] = await Promise.all([
                    fetch(url, { cache: 'no-store' }),
                    fetch(postUrl, { cache: 'no-store' }).catch(() => null) // post lỗi thì bỏ qua
                ])

                if (!resResume.ok) throw new Error(`HTTP ${resResume.status}`)

                const json = await resResume.json()
                const postsJson = resPost && resPost.ok ? await resPost.json() : []

                // Chuẩn hoá các URL ảnh trong resume (avatar, projects.images, ...)
                const r = structuredClone(json)
                if (r?.profile?.avatar) r.profile.avatar = fixUrl(r.profile.avatar)
                if (Array.isArray(r?.projects)) {
                    r.projects = r.projects.map(p => ({
                        ...p,
                        images: Array.isArray(p.images) ? p.images.map(fixUrl) : p.images
                    }))
                }

                // Chuẩn hoá posts
                const p = Array.isArray(postsJson) ? postsJson.map(post => ({
                    ...post,
                    images: Array.isArray(post.images) ? post.images.map(fixUrl) : []
                })) : []

                this.resume = r
                this.posts = p
            } catch (e) {
                console.error('[resume] fetch failed:', e)
                this.error = e.message || String(e)
            } finally {
                this.loading = false
            }
        },
        async refresh() {
            await this.load()
        }
    }
})
