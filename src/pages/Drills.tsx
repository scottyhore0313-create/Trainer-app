import { useMemo, useState } from 'react'
import { DRILLS, DRILL_CATEGORY_LABEL, type DrillCategory } from '../data/drills'

const CATEGORIES: Array<DrillCategory | 'all'> = [
  'all',
  'stance',
  'footwork',
  'power',
  'balance',
  'guard',
  'athleticism',
]

const LEVEL_STYLES: Record<string, string> = {
  beginner: 'bg-cyan-500/15 text-cyan-500',
  intermediate: 'bg-volt-500/15 text-volt-500',
  advanced: 'bg-power-500/15 text-power-400',
}

export default function Drills() {
  const [category, setCategory] = useState<DrillCategory | 'all'>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return DRILLS.filter((d) => {
      if (category !== 'all' && d.category !== category) return false
      if (query.trim()) {
        const q = query.toLowerCase()
        return (
          d.title.toLowerCase().includes(q) || d.summary.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [category, query])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-volt-500">
          Drill library
        </p>
        <h1 className="mt-2 font-display text-3xl font-black text-mist-200 sm:text-4xl">
          Exercises to build every category
        </h1>
        <p className="mt-3 max-w-2xl text-mist-400">
          Browse drills by category, or jump here straight from your analysis
          results for the ones matched to what you need to work on.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                category === c
                  ? 'border-volt-500 bg-volt-500 text-ink-950'
                  : 'border-ink-600 text-mist-300 hover:border-mist-400'
              }`}
            >
              {c === 'all' ? 'All' : DRILL_CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search drills…"
          className="w-full rounded-lg border border-ink-600 bg-ink-900 px-3.5 py-2 text-sm text-mist-200 placeholder:text-mist-400 focus:border-volt-500 focus:outline-none sm:w-64"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((drill) => (
          <article
            key={drill.id}
            className="flex flex-col rounded-2xl border border-ink-700 bg-ink-900 p-5"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-volt-500">
                {DRILL_CATEGORY_LABEL[drill.category]}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${LEVEL_STYLES[drill.level]}`}
              >
                {drill.level}
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-mist-200">
              {drill.title}
            </h3>
            <p className="mt-1 text-xs font-medium text-mist-400">{drill.duration}</p>
            <p className="mt-2 text-sm text-mist-300">{drill.summary}</p>
            <ol className="mt-4 space-y-1.5 border-t border-ink-700 pt-3 text-sm text-mist-400">
              {drill.steps.map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-0.5 shrink-0 font-mono text-xs text-volt-500">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-mist-400">
          No drills match that search.
        </p>
      )}
    </div>
  )
}
