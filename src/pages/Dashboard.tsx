import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { deleteSession, loadSessions, type SessionRecord } from '../lib/storage'
import { DRILL_CATEGORY_LABEL, type DrillCategory } from '../data/drills'
import ScoreRing from '../components/ScoreRing'

const CATEGORY_COLORS: Record<string, string> = {
  stance: '#c8ff3a',
  footwork: '#35e8e0',
  power: '#ff7a86',
  balance: '#d7ff6e',
  guard: '#a4abbd',
  athleticism: '#c8ff3a',
}

export default function Dashboard() {
  const [sessions, setSessions] = useState<SessionRecord[]>(() => loadSessions())

  const chartData = useMemo(() => {
    const chronological = [...sessions].sort((a, b) => a.createdAt - b.createdAt)
    return chronological.map((s) => {
      const entry: Record<string, number | string> = {
        date: new Date(s.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        }),
        overall: s.report.overallScore,
      }
      for (const c of s.report.categories) {
        entry[c.category] = c.score
      }
      return entry
    })
  }, [sessions])

  const presentCategories = useMemo(() => {
    const set = new Set<DrillCategory>()
    sessions.forEach((s) => s.report.categories.forEach((c) => set.add(c.category)))
    return Array.from(set)
  }, [sessions])

  const latest = sessions[0]
  const avgOverall = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + s.report.overallScore, 0) / sessions.length)
    : 0

  function handleDelete(id: string) {
    deleteSession(id)
    setSessions(loadSessions())
  }

  if (sessions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-3xl font-black text-mist-200">
          No sessions yet
        </h1>
        <p className="mt-3 text-mist-400">
          Record or upload your first clip and your progress will start
          showing up here.
        </p>
        <Link
          to="/analyze"
          className="mt-6 inline-block rounded-full bg-volt-500 px-6 py-2.5 text-sm font-bold text-ink-950 transition hover:bg-volt-400"
        >
          Start a session
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-black text-mist-200 sm:text-4xl">
        Your progress
      </h1>
      <p className="mt-2 text-mist-400">
        {sessions.length} session{sessions.length === 1 ? '' : 's'} tracked
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-ink-700 bg-ink-900 p-5">
          <ScoreRing score={latest.report.overallScore} size={72} strokeWidth={7} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-mist-400">
              Latest score
            </p>
            <p className="text-sm text-mist-300">{latest.label}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-mist-400">
            Average score
          </p>
          <p className="mt-2 font-display text-3xl font-black text-mist-200">
            {avgOverall}
          </p>
        </div>
        <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-mist-400">
            Total sessions
          </p>
          <p className="mt-2 font-display text-3xl font-black text-mist-200">
            {sessions.length}
          </p>
        </div>
      </div>

      {chartData.length > 1 && (
        <div className="mt-8 rounded-2xl border border-ink-700 bg-ink-900 p-5">
          <p className="mb-4 text-sm font-semibold text-mist-200">Score trend</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#1a1e28" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#7a8296"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#262b38' }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#7a8296"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#12151c',
                    border: '1px solid #262b38',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: '#d3d7e0' }}
                />
                <Line
                  type="monotone"
                  dataKey="overall"
                  name="Overall"
                  stroke="#c8ff3a"
                  strokeWidth={3}
                  dot={false}
                />
                {presentCategories.map((cat) => (
                  <Line
                    key={cat}
                    type="monotone"
                    dataKey={cat}
                    name={DRILL_CATEGORY_LABEL[cat]}
                    stroke={CATEGORY_COLORS[cat]}
                    strokeWidth={1.5}
                    strokeOpacity={0.6}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="mt-8">
        <p className="mb-4 text-sm font-semibold text-mist-200">Session history</p>
        <div className="space-y-3">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-4 rounded-2xl border border-ink-700 bg-ink-900 p-4"
            >
              {s.thumbnail ? (
                <img
                  src={s.thumbnail}
                  alt=""
                  className="h-14 w-20 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="h-14 w-20 shrink-0 rounded-lg bg-ink-800" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-mist-200">
                  {s.label}
                </p>
                <p className="mt-0.5 text-xs text-mist-400">
                  {s.report.categories
                    .map((c) => `${c.label} ${Math.round(c.score)}`)
                    .join(' · ')}
                </p>
              </div>
              <span className="font-display text-xl font-black text-mist-200">
                {s.report.overallScore}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(s.id)}
                aria-label="Delete session"
                className="shrink-0 rounded-full p-2 text-mist-400 transition hover:bg-power-500/10 hover:text-power-400"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-9 0 1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
