import type { MetricsResult } from './metrics'
import { DRILLS, type Drill, type DrillCategory } from '../data/drills'

export interface CategoryFeedback {
  category: DrillCategory
  label: string
  score: number
  tips: string[]
  tags: string[]
  drills: Drill[]
}

export interface FeedbackReport {
  overallScore: number
  generatedAt: number
  categories: CategoryFeedback[]
  topPriorities: string[]
  strengths: string[]
}

/** Trapezoidal scoring: 100 inside [idealMin, idealMax], falling to 0 at the hard bounds. */
function scoreRange(
  value: number,
  hardMin: number,
  idealMin: number,
  idealMax: number,
  hardMax: number,
): number {
  if (!Number.isFinite(value)) return NaN
  if (value >= idealMin && value <= idealMax) return 100
  if (value < idealMin) {
    if (value <= hardMin) return 0
    return Math.round(((value - hardMin) / (idealMin - hardMin)) * 100)
  }
  if (value >= hardMax) return 0
  return Math.round(((hardMax - value) / (hardMax - idealMax)) * 100)
}

function pickDrills(tags: string[], limit = 3): Drill[] {
  const tagSet = new Set(tags)
  const matched = DRILLS.filter((d) => d.tags.some((t) => tagSet.has(t)))
  const seen = new Set<string>()
  const unique: Drill[] = []
  for (const d of matched) {
    if (!seen.has(d.id)) {
      seen.add(d.id)
      unique.push(d)
    }
    if (unique.length >= limit) break
  }
  return unique
}

export function buildFeedbackReport(metrics: MetricsResult): FeedbackReport {
  const categories: CategoryFeedback[] = []

  // --- Stance ---
  {
    const tips: string[] = []
    const tags: string[] = []
    const stanceScore = scoreRange(metrics.stanceWidthRatio, 0.55, 0.95, 1.55, 2.1)
    if (metrics.stanceWidthRatio < 0.95) {
      tips.push(
        'Your feet are staying close together. Widen your base slightly past shoulder width for a stronger, harder-to-topple stance.',
      )
      tags.push('stance_narrow')
    } else if (metrics.stanceWidthRatio > 1.55) {
      tips.push(
        'Your stance is quite wide, which can limit how quickly you move. Bring your feet in a bit for a better balance of stability and mobility.',
      )
      tags.push('stance_wide')
    } else {
      tips.push('Your stance width is in a solid, balanced range — good base to build from.')
    }

    if (metrics.kneeFlexionDeg < 15) {
      tips.push(
        'Your knees are close to locked out. Soften them into a slight bend — it keeps you ready to move and protects your joints.',
      )
      tags.push('knee_straight')
    } else if (metrics.kneeFlexionDeg > 55) {
      tips.push(
        "You're sitting quite low in your stance. That can be great for power, but make sure it's intentional — too deep for too long burns extra energy.",
      )
    } else {
      tips.push('Knee bend looks athletic — enough flex to move explosively in any direction.')
    }

    if (metrics.kneeAsymmetryDeg > 12) {
      tips.push(
        `There's a noticeable difference between your left and right knee bend (~${Math.round(metrics.kneeAsymmetryDeg)}°). Check that your weight is evenly distributed between both legs.`,
      )
    }

    const score = Math.round(
      mean([stanceScore, scoreRange(metrics.kneeFlexionDeg, 5, 20, 50, 65)].filter(isNum)),
    )
    categories.push({
      category: 'stance',
      label: 'Stance',
      score: clampScore(score),
      tips,
      tags,
      drills: pickDrills(tags.length ? tags : ['stance_narrow']),
    })
  }

  // --- Footwork ---
  {
    const tips: string[] = []
    const tags: string[] = []
    const intensityScore = scoreRange(metrics.footworkIntensity, 0, 0.06, 5, 5)
    if (metrics.footworkIntensity < 0.06) {
      tips.push(
        'Your feet were mostly planted. Active, light footwork keeps you ready to react — try staying on the balls of your feet with small adjustment steps.',
      )
      tags.push('footwork_low')
    } else {
      tips.push('Good foot activity — you were making regular adjustment steps rather than standing flat-footed.')
    }

    if (metrics.stepCadencePerMin < 30) {
      tips.push('Your step rate was low. Add more frequent small steps rather than big, infrequent ones — it keeps your base reactive.')
      tags.push('cadence_low')
    }

    const score = Math.round(
      mean([intensityScore, scoreRange(metrics.stepCadencePerMin, 0, 30, 220, 260)].filter(isNum)),
    )
    categories.push({
      category: 'footwork',
      label: 'Footwork',
      score: clampScore(score),
      tips,
      tags,
      drills: pickDrills(tags.length ? tags : ['footwork_low']),
    })
  }

  // --- Power & Explosiveness ---
  {
    const tips: string[] = []
    const tags: string[] = []
    const burstScore = scoreRange(metrics.footworkBurst, 0, 0.18, 4, 4)
    const loadScore = scoreRange(metrics.kneeFlexionDeg, 5, 20, 55, 70)
    if (metrics.footworkBurst < 0.18) {
      tips.push(
        'We didn\'t see much explosive burst speed in your movement. Power starts with a strong knee bend and an explosive push — drills like squat jumps and broad jumps build this directly.',
      )
      tags.push('power_low')
    } else {
      tips.push('You showed good burst speed in your movement — a sign of explosive push-off.')
    }
    tips.push(
      'Note: true power (force output) can\'t be fully measured from video alone — this score is a proxy based on movement speed and knee loading.',
    )

    const score = Math.round(mean([burstScore, loadScore].filter(isNum)))
    categories.push({
      category: 'power',
      label: 'Power & Explosiveness',
      score: clampScore(score),
      tips,
      tags,
      drills: pickDrills(tags.length ? tags : ['power_low']),
    })
  }

  // --- Balance & Control ---
  {
    const tips: string[] = []
    const tags: string[] = []
    const swayScore = scoreRange(metrics.lateralSwayNorm, 0.4, 0, 0.16, 0.4)
    const bounceScore = scoreRange(metrics.comBounceNorm, 0.5, 0, 0.22, 0.5)
    const leanScore = scoreRange(metrics.torsoLeanDeg, 0, 0, 18, 32)

    if (metrics.lateralSwayNorm > 0.16) {
      tips.push('Your center of mass drifted side to side more than ideal. Tighten your core to keep your base more centered.')
      tags.push('sway_high')
    }
    if (metrics.comBounceNorm > 0.22) {
      tips.push('There was a fair amount of vertical bobbing. Some bounce is normal, but too much wastes energy — try smoother, more controlled level changes.')
      tags.push('bounce_high')
    }
    if (metrics.torsoLeanDeg > 18) {
      tips.push('Your torso is leaning noticeably forward or back. Stack your shoulders back over your hips to stay balanced and ready to move any direction.')
      tags.push('lean_high')
    }
    if (!tips.length) {
      tips.push('Your balance and control looked solid — centered, controlled movement throughout.')
    }

    const score = Math.round(mean([swayScore, bounceScore, leanScore].filter(isNum)))
    categories.push({
      category: 'balance',
      label: 'Balance & Control',
      score: clampScore(score),
      tips,
      tags,
      drills: pickDrills(tags.length ? tags : ['sway_high']),
    })
  }

  // --- Guard & Upper Body (only if we could see the hands) ---
  if (Number.isFinite(metrics.guardHeightScore)) {
    const tips: string[] = []
    const tags: string[] = []
    const guardScore = Math.round(metrics.guardHeightScore * 100)
    if (metrics.guardHeightScore < 0.45) {
      tips.push('Your hands were dropping below chin height for a lot of the clip. Keep your guard up near your chin/cheek to stay protected.')
      tags.push('guard_low')
    } else {
      tips.push('Your guard height looked solid — hands stayed up and ready.')
    }
    if (Number.isFinite(metrics.elbowTuckNorm) && metrics.elbowTuckNorm > 0.85) {
      tips.push('Your elbows are flaring away from your body. Tuck them closer to your ribs to protect your body and stay compact.')
      tags.push('elbow_flare')
    }

    const elbowScore = Number.isFinite(metrics.elbowTuckNorm)
      ? scoreRange(metrics.elbowTuckNorm, 1.3, 0, 0.7, 1.3)
      : NaN
    const score = Math.round(mean([guardScore, elbowScore].filter(isNum)))
    categories.push({
      category: 'guard',
      label: 'Guard & Upper Body',
      score: clampScore(score),
      tips,
      tags,
      drills: pickDrills(tags.length ? tags : ['guard_low']),
    })
  }

  const overallScore = Math.round(mean(categories.map((c) => c.score)))

  const sorted = [...categories].sort((a, b) => a.score - b.score)
  const topPriorities = sorted
    .slice(0, 2)
    .filter((c) => c.score < 80)
    .map((c) => `${c.label}: ${c.tips[0]}`)
  const strengths = sorted
    .slice(-2)
    .filter((c) => c.score >= 75)
    .map((c) => c.label)

  return {
    overallScore: clampScore(overallScore),
    generatedAt: Date.now(),
    categories,
    topPriorities,
    strengths,
  }
}

function mean(values: number[]): number {
  if (!values.length) return NaN
  return values.reduce((a, b) => a + b, 0) / values.length
}

function isNum(v: number): boolean {
  return Number.isFinite(v)
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 50
  return Math.min(100, Math.max(0, score))
}
