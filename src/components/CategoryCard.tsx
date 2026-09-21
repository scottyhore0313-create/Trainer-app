import { Link } from 'react-router-dom'
import type { CategoryFeedback } from '../lib/feedback'
import { ScoreBar } from './ScoreRing'

export default function CategoryCard({ category }: { category: CategoryFeedback }) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-mist-200">
          {category.label}
        </h3>
        <span className="font-display text-xl font-black text-mist-200">
          {Math.round(category.score)}
        </span>
      </div>
      <ScoreBar score={category.score} />

      <ul className="mt-4 space-y-2 text-sm text-mist-300">
        {category.tips.map((tip, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-volt-500" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>

      {category.drills.length > 0 && (
        <div className="mt-4 border-t border-ink-700 pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-mist-400">
            Recommended drills
          </p>
          <div className="flex flex-wrap gap-2">
            {category.drills.map((drill) => (
              <Link
                key={drill.id}
                to="/drills"
                className="rounded-full border border-ink-600 px-3 py-1 text-xs font-medium text-mist-300 transition hover:border-volt-500 hover:text-volt-500"
              >
                {drill.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
