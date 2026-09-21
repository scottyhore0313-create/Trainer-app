import type { MetricsResult } from './metrics'
import type { FeedbackReport } from './feedback'

export interface SessionRecord {
  id: string
  createdAt: number
  label: string
  metrics: MetricsResult
  report: FeedbackReport
  thumbnail?: string
}

const STORAGE_KEY = 'kinetik.sessions.v1'

export function loadSessions(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SessionRecord[]
    if (!Array.isArray(parsed)) return []
    return parsed.sort((a, b) => b.createdAt - a.createdAt)
  } catch {
    return []
  }
}

export function saveSession(session: SessionRecord): void {
  const sessions = loadSessions()
  sessions.unshift(session)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 100)))
  } catch {
    // Storage full or unavailable — fail silently, the session is still shown this visit.
  }
}

export function deleteSession(id: string): void {
  const sessions = loadSessions().filter((s) => s.id !== id)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  } catch {
    // ignore
  }
}

export function clearSessions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function makeSessionId(): string {
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
