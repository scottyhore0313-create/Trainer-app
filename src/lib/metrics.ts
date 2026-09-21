import type { Keypoint, PoseFrame } from './pose'

const MIN_SCORE = 0.3

function kp(frame: PoseFrame, name: string): Keypoint | undefined {
  const point = frame.keypoints.find((k) => k.name === name)
  if (!point || (point.score ?? 0) < MIN_SCORE) return undefined
  return point
}

function dist(a: Keypoint, b: Keypoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function midpoint(a: Keypoint, b: Keypoint): { x: number; y: number } {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

/** Interior angle at vertex `b`, in degrees, for points a-b-c. */
function angleAt(a: Keypoint, b: Keypoint, c: Keypoint): number {
  const ab = { x: a.x - b.x, y: a.y - b.y }
  const cb = { x: c.x - b.x, y: c.y - b.y }
  const dot = ab.x * cb.x + ab.y * cb.y
  const magAB = Math.hypot(ab.x, ab.y)
  const magCB = Math.hypot(cb.x, cb.y)
  if (magAB === 0 || magCB === 0) return NaN
  const cos = Math.min(1, Math.max(-1, dot / (magAB * magCB)))
  return (Math.acos(cos) * 180) / Math.PI
}

function mean(values: number[]): number {
  const clean = values.filter((v) => Number.isFinite(v))
  if (clean.length === 0) return NaN
  return clean.reduce((a, b) => a + b, 0) / clean.length
}

function stdev(values: number[]): number {
  const clean = values.filter((v) => Number.isFinite(v))
  if (clean.length < 2) return 0
  const m = mean(clean)
  return Math.sqrt(mean(clean.map((v) => (v - m) ** 2)))
}

export interface MetricsResult {
  frameCount: number
  durationSec: number
  avgConfidence: number

  /** Ankle spread relative to shoulder width. ~1.0 = shoulder width. */
  stanceWidthRatio: number
  /** Average knee flexion (180deg = fully locked straight, lower = more bent). */
  kneeFlexionDeg: number
  kneeFlexionLeft: number
  kneeFlexionRight: number
  kneeAsymmetryDeg: number
  /** Forward/back torso lean from vertical, in degrees. */
  torsoLeanDeg: number
  /** Side-to-side sway of the hip center, normalized by torso length. */
  lateralSwayNorm: number
  /** Vertical bob of the hip center (center of mass), normalized by torso length. */
  comBounceNorm: number
  /** Average normalized foot speed across the clip (footwork activity). */
  footworkIntensity: number
  /** Peak normalized foot speed (explosive burst proxy for power). */
  footworkBurst: number
  /** Estimated foot direction-change / step rate, per minute. */
  stepCadencePerMin: number
  /** 0-1: how consistently hands are held at/above shoulder height (guard). */
  guardHeightScore: number
  /** Average elbow distance from the torso centerline, normalized (lower = tighter guard). */
  elbowTuckNorm: number
}

export function computeMetrics(frames: PoseFrame[]): MetricsResult | null {
  if (frames.length < 3) return null

  const stanceRatios: number[] = []
  const kneeLeftAngles: number[] = []
  const kneeRightAngles: number[] = []
  const torsoLeans: number[] = []
  const hipCentersX: number[] = []
  const hipCentersY: number[] = []
  const scaleRefs: number[] = []
  const guardScores: number[] = []
  const elbowTucks: number[] = []
  const confidences: number[] = []

  const leftAnklePositions: Array<{ t: number; x: number; y: number } | null> = []
  const rightAnklePositions: Array<{ t: number; x: number; y: number } | null> = []

  for (const frame of frames) {
    const lShoulder = kp(frame, 'left_shoulder')
    const rShoulder = kp(frame, 'right_shoulder')
    const lHip = kp(frame, 'left_hip')
    const rHip = kp(frame, 'right_hip')
    const lKnee = kp(frame, 'left_knee')
    const rKnee = kp(frame, 'right_knee')
    const lAnkle = kp(frame, 'left_ankle')
    const rAnkle = kp(frame, 'right_ankle')
    const lWrist = kp(frame, 'left_wrist')
    const rWrist = kp(frame, 'right_wrist')
    const lElbow = kp(frame, 'left_elbow')
    const rElbow = kp(frame, 'right_elbow')

    const frameScores = frame.keypoints
      .map((k) => k.score ?? 0)
      .filter((s) => s > 0)
    if (frameScores.length) confidences.push(mean(frameScores))

    if (lShoulder && rShoulder) {
      const shoulderWidth = dist(lShoulder, rShoulder)
      const torsoRef =
        lHip && lShoulder ? dist(lShoulder, lHip) : shoulderWidth * 1.3
      scaleRefs.push(torsoRef || shoulderWidth)

      if (lAnkle && rAnkle && shoulderWidth > 1) {
        stanceRatios.push(dist(lAnkle, rAnkle) / shoulderWidth)
      }

      if (lHip && rHip) {
        const shoulderMid = midpoint(lShoulder, rShoulder)
        const hipMid = midpoint(lHip, rHip)
        hipCentersX.push(hipMid.x)
        hipCentersY.push(hipMid.y)
        const dx = shoulderMid.x - hipMid.x
        const dy = shoulderMid.y - hipMid.y
        torsoLeans.push((Math.atan2(Math.abs(dx), Math.abs(dy) || 1) * 180) / Math.PI)
      }

      if (lWrist && rWrist) {
        const noseOrShoulderY = shoulderMid(lShoulder, rShoulder).y
        const avgWristY = (lWrist.y + rWrist.y) / 2
        // Higher hands (smaller y) -> closer to/above shoulder line -> better guard.
        const raw = (noseOrShoulderY - avgWristY) / (torsoRef || 1)
        guardScores.push(clamp01(0.5 + raw))
      }
      if (lElbow && rElbow) {
        const centerX = (lShoulder.x + rShoulder.x) / 2
        const avgElbowSpread =
          (Math.abs(lElbow.x - centerX) + Math.abs(rElbow.x - centerX)) / 2
        elbowTucks.push(avgElbowSpread / (shoulderWidth || 1))
      }
    }

    if (lHip && lKnee && lAnkle) {
      kneeLeftAngles.push(angleAt(lHip, lKnee, lAnkle))
    }
    if (rHip && rKnee && rAnkle) {
      kneeRightAngles.push(angleAt(rHip, rKnee, rAnkle))
    }

    leftAnklePositions.push(lAnkle ? { t: frame.time, x: lAnkle.x, y: lAnkle.y } : null)
    rightAnklePositions.push(rAnkle ? { t: frame.time, x: rAnkle.x, y: rAnkle.y } : null)
  }

  const scaleRef = mean(scaleRefs) || 1
  const { intensity, burst, cadence } = analyzeFootwork(
    [leftAnklePositions, rightAnklePositions],
    scaleRef,
  )

  const kneeFlexionLeft = 180 - mean(kneeLeftAngles)
  const kneeFlexionRight = 180 - mean(kneeRightAngles)

  return {
    frameCount: frames.length,
    durationSec: frames[frames.length - 1].time - frames[0].time,
    avgConfidence: mean(confidences) || 0,
    stanceWidthRatio: mean(stanceRatios),
    kneeFlexionDeg: mean([kneeFlexionLeft, kneeFlexionRight]),
    kneeFlexionLeft,
    kneeFlexionRight,
    kneeAsymmetryDeg: Math.abs(kneeFlexionLeft - kneeFlexionRight),
    torsoLeanDeg: mean(torsoLeans),
    lateralSwayNorm: stdev(hipCentersX) / (scaleRef || 1),
    comBounceNorm: stdev(hipCentersY) / (scaleRef || 1),
    footworkIntensity: intensity,
    footworkBurst: burst,
    stepCadencePerMin: cadence,
    guardHeightScore: guardScores.length ? mean(guardScores) : NaN,
    elbowTuckNorm: elbowTucks.length ? mean(elbowTucks) : NaN,
  }
}

function shoulderMid(l: Keypoint, r: Keypoint) {
  return midpoint(l, r)
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v))
}

/** Minimum time between counted step events on one foot — filters keypoint jitter. */
const STEP_REFRACTORY_SEC = 0.25
/** Sign-reversal amplitude must clear this fraction of the body scale to count as a step. */
const STEP_THRESHOLD_FACTOR = 0.05

function smoothTrack(
  track: Array<{ t: number; x: number; y: number } | null>,
): Array<{ t: number; x: number; y: number } | null> {
  return track.map((point, i) => {
    if (!point) return null
    const prev = track[i - 1]
    const next = track[i + 1]
    const neighbors = [prev, point, next].filter(
      (p): p is { t: number; x: number; y: number } => !!p,
    )
    const x = mean(neighbors.map((p) => p.x))
    const y = mean(neighbors.map((p) => p.y))
    return { t: point.t, x, y }
  })
}

function analyzeFootwork(
  ankleTracks: Array<Array<{ t: number; x: number; y: number } | null>>,
  scaleRef: number,
): { intensity: number; burst: number; cadence: number } {
  const speeds: number[] = []
  let stepEvents = 0
  let totalTime = 0

  for (const rawTrack of ankleTracks) {
    const track = smoothTrack(rawTrack)
    let prev: { t: number; x: number; y: number } | null = null
    let prevVx: number | null = null
    let lastStepTime = -Infinity
    for (const point of track) {
      if (!point) {
        prev = null
        prevVx = null
        continue
      }
      if (prev) {
        const dt = point.t - prev.t
        if (dt > 0) {
          const speed = Math.hypot(point.x - prev.x, point.y - prev.y) / dt / (scaleRef || 1)
          speeds.push(speed)
          totalTime = Math.max(totalTime, point.t)

          const vx = (point.x - prev.x) / dt
          const clearsThreshold = Math.abs(vx) > STEP_THRESHOLD_FACTOR * scaleRef
          const reversed = prevVx !== null && Math.sign(vx) !== Math.sign(prevVx)
          const pastRefractory = point.t - lastStepTime >= STEP_REFRACTORY_SEC
          if (reversed && clearsThreshold && pastRefractory) {
            stepEvents += 1
            lastStepTime = point.t
          }
          prevVx = vx
        }
      }
      prev = point
    }
  }

  const intensity = mean(speeds) || 0
  const sorted = [...speeds].filter(Number.isFinite).sort((a, b) => a - b)
  const burst = sorted.length ? sorted[Math.floor(sorted.length * 0.95)] ?? sorted[sorted.length - 1] : 0
  const cadence = totalTime > 0 ? (stepEvents / totalTime) * 60 : 0

  return { intensity, burst, cadence }
}
