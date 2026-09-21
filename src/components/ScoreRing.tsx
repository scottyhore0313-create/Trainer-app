function scoreColor(score: number): string {
  if (score >= 80) return '#c8ff3a'
  if (score >= 55) return '#35e8e0'
  return '#ff4d5e'
}

export default function ScoreRing({
  score,
  size = 128,
  strokeWidth = 10,
  label,
}: {
  score: number
  size?: number
  strokeWidth?: number
  label?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 100)
  const color = scoreColor(score)

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1a1e28"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-3xl font-black text-mist-200">
          {Math.round(score)}
        </span>
        {label && <span className="text-xs text-mist-400">{label}</span>}
      </div>
    </div>
  )
}

export function ScoreBar({ score }: { score: number }) {
  const color = scoreColor(score)
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.round(score)}%`, background: color }}
      />
    </div>
  )
}
