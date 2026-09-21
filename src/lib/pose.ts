import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import * as poseDetection from '@tensorflow-models/pose-detection'

export type Keypoint = poseDetection.Keypoint

export interface PoseFrame {
  time: number
  keypoints: Keypoint[]
}

let detectorPromise: Promise<poseDetection.PoseDetector> | null = null

async function getDetector(): Promise<poseDetection.PoseDetector> {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      try {
        await tf.setBackend('webgl')
      } catch {
        await tf.setBackend('cpu')
      }
      await tf.ready()
      return poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
      })
    })().catch((err) => {
      // Let the next call retry instead of replaying this rejection forever.
      detectorPromise = null
      throw err
    })
  }
  return detectorPromise
}

/** Preloads the pose model so the first real analysis doesn't stall on download. */
export function warmUpPoseDetector(): void {
  getDetector().catch(() => {
    // Swallow here — analyzeVideoFrames will surface the error when the
    // user actually tries to analyze a clip, and getDetector allows retry.
  })
}

export interface AnalyzeOptions {
  /** How many frames per second of the source video to sample. */
  sampleFps?: number
  /** Cap on total video seconds analyzed, to keep client-side inference snappy. */
  maxDurationSec?: number
  onProgress?: (ratio: number) => void
  onFrame?: (frame: PoseFrame) => void
  signal?: AbortSignal
}

/**
 * Steps through a video by seeking (rather than relying on playback timing),
 * so sampling is deterministic regardless of decode speed or frame rate.
 */
export async function analyzeVideoFrames(
  video: HTMLVideoElement,
  opts: AnalyzeOptions = {},
): Promise<PoseFrame[]> {
  const detector = await getDetector()
  const sampleFps = opts.sampleFps ?? 8
  const duration = Math.min(
    video.duration || 0,
    opts.maxDurationSec ?? (video.duration || 0),
  )
  if (!isFinite(duration) || duration <= 0) return []

  const interval = 1 / sampleFps
  const frames: PoseFrame[] = []
  const wasPlaying = !video.paused
  video.pause()

  const seekTo = (t: number) =>
    new Promise<void>((resolve) => {
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked)
        resolve()
      }
      video.addEventListener('seeked', onSeeked)
      video.currentTime = t
    })

  let t = 0
  while (t < duration) {
    if (opts.signal?.aborted) break
    await seekTo(t)
    const poses = await detector.estimatePoses(video, { flipHorizontal: false })
    if (poses[0]) {
      const frame: PoseFrame = { time: t, keypoints: poses[0].keypoints }
      frames.push(frame)
      opts.onFrame?.(frame)
    }
    opts.onProgress?.(Math.min(1, t / duration))
    t += interval
  }

  opts.onProgress?.(1)
  if (wasPlaying) video.play().catch(() => {})
  return frames
}
