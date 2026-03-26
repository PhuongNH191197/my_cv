// src/server/index.mjs
import express from 'express'
import OpenAI from 'openai'
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

// Ưu tiên .env.<NODE_ENV> (mặc định development), fallback .env
const envName = process.env.NODE_ENV || 'development'
const envPath = resolve(process.cwd(), `.env.${envName}`)
loadEnv({ path: existsSync(envPath) ? envPath : resolve(process.cwd(), '.env') })

const app = express()
app.use(express.json({ limit: '1mb' }))

// Kiểm tra API key
if (!process.env.OPENAI_API_KEY) {
    console.error(
        `[startup] Missing OPENAI_API_KEY in ${existsSync(envPath) ? `.env.${envName}` : '.env'}`
    )
    process.exit(1)
}

// OpenAI client (Responses API)
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Health check (cũ & mới)
app.get('/api/health', (req, res) => res.json({ ok: true }))
app.get('/assistant/health', (req, res) => res.json({ ok: true }))

// Handler dùng chung
const assistantHandler = async (req, res) => {
    try {
        const { messages = [], locale = 'vi', profile = {} } = req.body || {}
        const lang = (locale || 'vi').toString().toLowerCase().startsWith('vi') ? 'Vietnamese' : 'English'

        const system = [
            `You are the personal AI assistant for ${profile.name || 'the owner'}.`,
            `Answer in ${lang}.`,
            `Use the resume data if relevant:`,
            `- Title: ${profile.title || ''}`,
            `- Location: ${profile.location || ''}`,
            `- Summary: ${profile.summary || ''}`
        ].join(' ')

        const lastTurns = (Array.isArray(messages) ? messages : [])
            .slice(-8)
            .map(m => `${String(m.role || '').toUpperCase()}: ${m.text ?? ''}`)
            .join('\n')

        const r = await client.responses.create({
            model: 'gpt-4o-mini',
            instructions: system,
            input: `Conversation:\n${lastTurns}\nASSISTANT:`,
            temperature: 0.3
        })

        res.json({ reply: r.output_text ?? '' })
    } catch (e) {
        console.error('[assistant] error:', e)
        // Chuẩn hoá lỗi trả về cho frontend
        res
            .status(500)
            .json({ error: 'Assistant API error', detail: e?.message || String(e) })
    }
}

// Route mới khuyến nghị (tránh trùng /api của static)
app.post('/assistant', assistantHandler)

// Route cũ để tương thích (nếu frontend chưa đổi kịp)
app.post('/api/assistant', assistantHandler)

// Khởi động
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 8080
    app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`))
}

export default app
