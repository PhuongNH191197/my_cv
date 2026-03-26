import { defineStore } from 'pinia'

const LS_DRAFTS = 'mycv_posts_drafts_v1' // chỉ lưu bài do bạn đăng tại client
const REMOTE_PATH = 'api/post.json'     // file trong public/

function fixUrl(p) {
    if (!p) return p
    if (/^https?:\/\//i.test(p)) return p
    const base = import.meta.env.BASE_URL || '/'
    const clean = p.startsWith('/') ? p.slice(1) : p
    return `${base}${clean}`
}
function normalize(arr) {
    return (arr || []).map(p => ({
        id: p.id || String(Date.now() + Math.random()),
        text: p.text || '',
        images: Array.isArray(p.images) ? p.images.map(fixUrl) : [],
        author: p.author || 'Unknown',
        likes: Number(p.likes) || 0,
        liked: !!p.liked,
        comments: Number(p.comments) || 0,
        createdAt: typeof p.createdAt === 'number' ? p.createdAt : Date.now(),
        activity: p.activity || 'other',
        place: p.place || '',
        when: p.when || '',
        rating: Number(p.rating) || 0
    }))
}
function mergeById(remote = [], drafts = []) {
    const map = new Map()
    // Ưu tiên dữ liệu remote nếu trùng id
    for (const p of remote) map.set(p.id, p)
    for (const d of drafts) if (!map.has(d.id)) map.set(d.id, d)
    return Array.from(map.values())
}

export const usePostsStore = defineStore('posts', {
    state: () => ({
        posts: [],
        drafts: []
    }),
    getters: {
        ordered: (s) => [...s.posts].sort((a, b) => b.createdAt - a.createdAt)
    },
    actions: {
        async load() {
            // 1) đọc drafts (bài do bạn đăng ở client)
            const raw = localStorage.getItem(LS_DRAFTS)
            this.drafts = raw ? JSON.parse(raw) : []

            // 2) fetch “API” mỗi lần load trang (cache buster)
            try {
                const url = `${import.meta.env.BASE_URL}${REMOTE_PATH}?cb=${Date.now()}`
                const res = await fetch(url, { cache: 'no-store' })
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const json = await res.json()
                const remote = normalize(json)

                // 3) merge remote + drafts
                this.posts = mergeById(remote, this.drafts)
            } catch (e) {
                console.error('[posts] fetch failed, fallback drafts only:', e)
                this.posts = [...this.drafts]
            }
        },

        persistDrafts() {
            localStorage.setItem(LS_DRAFTS, JSON.stringify(this.drafts))
        },

        add({ text, images = [], author, activity = 'other', place = '', when = Date.now() }) {
            const id = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now())
            const newPost = {
                id, text, images, author,
                likes: 0, liked: false, comments: 0,
                createdAt: Date.now(),
                activity, place, when,
                rating: 0
            }
            // hiển thị ngay trên UI
            this.posts.unshift(newPost)
            // lưu như “draft” client (vì chưa có API thật để POST)
            this.drafts.unshift(newPost)
            this.persistDrafts()
        },

        toggleLike(id) {
            const p = this.posts.find(x => x.id === id)
            if (!p) return
            p.liked = !p.liked
            p.likes += p.liked ? 1 : -1

            // đồng bộ like vào drafts nếu có
            const d = this.drafts.find(x => x.id === id)
            if (d) { d.liked = p.liked; d.likes = p.likes; this.persistDrafts() }
        },

        remove(id) {
            this.posts = this.posts.filter(x => x.id !== id)
            this.drafts = this.drafts.filter(x => x.id !== id)
            this.persistDrafts()
        },

        async refresh() {
            await this.load()
        }
    }
})
