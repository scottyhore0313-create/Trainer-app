import type { Keypoint } from './pose'

export const SKELETON_EDGES: Array<[string, string]> = [
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle'],
]

const MIN_SCORE = 0.3

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  scaleX: number,
  scaleY: number,
): void {
  const byName = new Map(keypoints.map((k) => [k.name, k]))

  ctx.lineWidth = 3
  ctx.strokeStyle = '#c8ff3a'
  for (const [a, b] of SKELETON_EDGES) {
    const pa = byName.get(a)
    const pb = byName.get(b)
    if (!pa || !pb) continue
    if ((pa.score ?? 0) < MIN_SCORE || (pb.score ?? 0) < MIN_SCORE) continue
    ctx.beginPath()
    ctx.moveTo(pa.x * scaleX, pa.y * scaleY)
    ctx.lineTo(pb.x * scaleX, pb.y * scaleY)
    ctx.stroke()
  }

  ctx.fillStyle = '#35e8e0'
  for (const kp of keypoints) {
    if ((kp.score ?? 0) < MIN_SCORE) continue
    ctx.beginPath()
    ctx.arc(kp.x * scaleX, kp.y * scaleY, 4, 0, Math.PI * 2)
    ctx.fill()
  }
}
