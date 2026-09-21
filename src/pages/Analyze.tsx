import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { analyzeVideoFrames, warmUpPoseDetector, type PoseFrame } from '../lib/pose'
import { computeMetrics, type MetricsResult } from '../lib/metrics'
import { buildFeedbackReport, type FeedbackReport } from '../lib/feedback'
import { captureThumbnail } from '../lib/thumbnail'
import { drawSkeleton } from '../lib/skeleton'
import { makeSessionId, saveSession } from '../lib/storage'
import ScoreRing from '../components/ScoreRing'
import CategoryCard from '../components/CategoryCard'

type Stage = 'setup' | 'recording' | 'preview' | 'analyzing' | 'results' | 'error'

const MAX_RECORD_SECONDS = 15
const MAX_ANALYZE_SECONDS = 20

export default function Analyze() {
  const [stage, setStage] = useState<Stage>('setup')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [frameCount, setFrameCount] = useState(0)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [metrics, setMetrics] = useState<MetricsResult | null>(null)
  const [report, setReport] = useState<FeedbackReport | null>(null)
  const [cameraReady, setCameraReady] = useState(false)

  const liveVideoRef = useRef<HTMLVideoElement>(null)
  const previewVideoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const recordTimerRef = useRef<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    warmUpPoseDetector()
    return () => {
      stopCamera()
      if (videoUrl) URL.revokeObjectURL(videoUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (recordTimerRef.current) {
      window.clearInterval(recordTimerRef.current)
      recordTimerRef.current = null
    }
  }

  async function enableCamera() {
    setErrorMsg(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream
        await liveVideoRef.current.play().catch(() => {})
      }
      setCameraReady(true)
    } catch {
      setErrorMsg(
        'Could not access your camera. Check your browser permissions, or upload a video file instead.',
      )
    }
  }

  function pickMimeType(): string | undefined {
    const options = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
    for (const opt of options) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(opt)) {
        return opt
      }
    }
    return undefined
  }

  function startRecording() {
    if (!streamRef.current) return
    chunksRef.current = []
    const mimeType = pickMimeType()
    const recorder = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : undefined)
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType ?? 'video/webm' })
      const url = URL.createObjectURL(blob)
      setVideoUrl(url)
      stopCamera()
      setCameraReady(false)
      setStage('preview')
    }
    recorderRef.current = recorder
    recorder.start()
    setRecordSeconds(0)
    setStage('recording')

    recordTimerRef.current = window.setInterval(() => {
      setRecordSeconds((s) => {
        const next = s + 1
        if (next >= MAX_RECORD_SECONDS) {
          stopRecording()
        }
        return next
      })
    }, 1000)
  }

  function stopRecording() {
    if (recordTimerRef.current) {
      window.clearInterval(recordTimerRef.current)
      recordTimerRef.current = null
    }
    recorderRef.current?.stop()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    const url = URL.createObjectURL(file)
    setVideoUrl(url)
    setStage('preview')
  }

  const waitForMetadata = (video: HTMLVideoElement) =>
    new Promise<void>((resolve) => {
      if (video.readyState >= 1) return resolve()
      const onLoaded = () => {
        video.removeEventListener('loadedmetadata', onLoaded)
        resolve()
      }
      video.addEventListener('loadedmetadata', onLoaded)
    })

  const runAnalysis = useCallback(async () => {
    const video = previewVideoRef.current
    if (!video) return
    setErrorMsg(null)
    setStage('analyzing')
    setProgress(0)
    setFrameCount(0)

    try {
      await waitForMetadata(video)

      const canvas = canvasRef.current
      if (canvas) {
        canvas.width = video.clientWidth || video.videoWidth
        canvas.height = video.clientHeight || video.videoHeight
      }
      const scaleX = canvas && video.videoWidth ? canvas.width / video.videoWidth : 1
      const scaleY = canvas && video.videoHeight ? canvas.height / video.videoHeight : 1

      const frames: PoseFrame[] = await analyzeVideoFrames(video, {
        sampleFps: 8,
        maxDurationSec: MAX_ANALYZE_SECONDS,
        onProgress: (r) => setProgress(r),
        onFrame: (frame) => {
          setFrameCount((c) => c + 1)
          const ctx = canvas?.getContext('2d')
          if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            drawSkeleton(ctx, frame.keypoints, scaleX, scaleY)
          }
        },
      })

      const thumbnail = captureThumbnail(video)
      const computed = computeMetrics(frames)

      if (!computed) {
        setErrorMsg(
          "We couldn't clearly detect a person in this clip. Try better lighting, make sure your full body is in frame, and hold the camera steady.",
        )
        setStage('error')
        return
      }

      const builtReport = buildFeedbackReport(computed)
      saveSession({
        id: makeSessionId(),
        createdAt: Date.now(),
        label: `Session — ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`,
        metrics: computed,
        report: builtReport,
        thumbnail,
      })

      setMetrics(computed)
      setReport(builtReport)
      setStage('results')
    } catch {
      setErrorMsg('Something went wrong analyzing that clip. Please try again.')
      setStage('error')
    }
  }, [])

  function reset() {
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    setVideoUrl(null)
    setMetrics(null)
    setReport(null)
    setErrorMsg(null)
    setProgress(0)
    setFrameCount(0)
    setCameraReady(false)
    stopCamera()
    if (fileInputRef.current) fileInputRef.current.value = ''
    setStage('setup')
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {stage === 'setup' && (
        <div>
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-black text-mist-200 sm:text-4xl">
              Record or upload your clip
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-mist-400">
              5–15 seconds is plenty. Stand far enough back that your full
              body — head to feet — is in frame, facing the camera.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 rounded-xl border border-power-500/40 bg-power-500/10 px-4 py-3 text-sm text-power-400">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-ink-700 bg-ink-900 p-6">
              <h2 className="font-display text-lg font-bold text-mist-200">
                Use your camera
              </h2>
              <p className="mt-1 text-sm text-mist-400">
                Record directly in the browser.
              </p>

              <div className="mt-4 aspect-video overflow-hidden rounded-xl bg-ink-950">
                <video
                  ref={liveVideoRef}
                  muted
                  playsInline
                  className={`h-full w-full object-cover ${cameraReady ? '' : 'hidden'}`}
                />
                {!cameraReady && (
                  <div className="flex h-full items-center justify-center text-mist-400">
                    <CameraIcon />
                  </div>
                )}
              </div>

              {!cameraReady ? (
                <button
                  type="button"
                  onClick={enableCamera}
                  className="mt-4 w-full rounded-full bg-volt-500 px-4 py-2.5 text-sm font-bold text-ink-950 transition hover:bg-volt-400"
                >
                  Enable camera
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="mt-4 w-full rounded-full bg-power-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-power-400"
                >
                  Start recording
                </button>
              )}
            </div>

            <div className="rounded-2xl border border-ink-700 bg-ink-900 p-6">
              <h2 className="font-display text-lg font-bold text-mist-200">
                Upload a video
              </h2>
              <p className="mt-1 text-sm text-mist-400">
                Already have a clip? Use one from your camera roll.
              </p>
              <div className="mt-4 flex aspect-video items-center justify-center rounded-xl border-2 border-dashed border-ink-600 bg-ink-950">
                <UploadIcon />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="mt-4 block w-full cursor-pointer rounded-full border border-ink-600 px-4 py-2.5 text-center text-sm font-semibold text-mist-200 transition hover:border-mist-400"
              >
                Choose a file
              </label>
            </div>
          </div>
        </div>
      )}

      {stage === 'recording' && (
        <div className="text-center">
          <div className="mx-auto aspect-video max-w-2xl overflow-hidden rounded-2xl bg-ink-950">
            <video ref={liveVideoRef} muted playsInline className="h-full w-full object-cover" />
          </div>
          <div className="mt-5 flex items-center justify-center gap-3">
            <span className="flex h-3 w-3 animate-pulse rounded-full bg-power-500" />
            <span className="font-mono text-lg text-mist-200">
              {recordSeconds}s / {MAX_RECORD_SECONDS}s
            </span>
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="mt-5 rounded-full bg-mist-200 px-6 py-2.5 text-sm font-bold text-ink-950 transition hover:bg-white"
          >
            Stop recording
          </button>
        </div>
      )}

      {(stage === 'preview' || stage === 'analyzing') && videoUrl && (
        <div className="text-center">
          <h1 className="font-display text-2xl font-black text-mist-200 sm:text-3xl">
            {stage === 'preview' ? 'Ready to analyze' : 'Analyzing your movement…'}
          </h1>
          <div className="relative mx-auto mt-5 max-w-2xl overflow-hidden rounded-2xl bg-ink-950">
            <video
              ref={previewVideoRef}
              src={videoUrl}
              controls={stage === 'preview'}
              playsInline
              className="w-full"
            />
            <canvas
              ref={canvasRef}
              className="pointer-events-none absolute inset-0 h-full w-full"
            />
          </div>

          {stage === 'preview' && (
            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={runAnalysis}
                className="rounded-full bg-volt-500 px-6 py-2.5 text-sm font-bold text-ink-950 transition hover:bg-volt-400"
              >
                Analyze this clip
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-ink-600 px-6 py-2.5 text-sm font-semibold text-mist-200 transition hover:border-mist-400"
              >
                Retake / choose another
              </button>
            </div>
          )}

          {stage === 'analyzing' && (
            <div className="mx-auto mt-6 max-w-md">
              <div className="h-2 w-full overflow-hidden rounded-full bg-ink-700">
                <div
                  className="h-full rounded-full bg-volt-500 transition-all duration-200"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-mist-400">
                {frameCount} frames processed — tracking 17 body points
              </p>
            </div>
          )}
        </div>
      )}

      {stage === 'error' && (
        <div className="text-center">
          <div className="mb-6 rounded-xl border border-power-500/40 bg-power-500/10 px-4 py-3 text-sm text-power-400">
            {errorMsg}
          </div>
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-volt-500 px-6 py-2.5 text-sm font-bold text-ink-950 transition hover:bg-volt-400"
          >
            Try again
          </button>
        </div>
      )}

      {stage === 'results' && report && metrics && (
        <div>
          <div className="flex flex-col items-center text-center">
            <ScoreRing score={report.overallScore} size={140} label="Overall" />
            <h1 className="mt-4 font-display text-2xl font-black text-mist-200 sm:text-3xl">
              Here's your breakdown
            </h1>
            <p className="mt-2 max-w-lg text-sm text-mist-400">
              Based on {metrics.frameCount} analyzed frames over{' '}
              {metrics.durationSec.toFixed(1)}s.
              {metrics.avgConfidence < 0.5 &&
                ' Detection confidence was low on parts of this clip — for best results, film in good lighting with your full body visible.'}
            </p>
          </div>

          {report.topPriorities.length > 0 && (
            <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-volt-500/30 bg-volt-500/5 p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-volt-500">
                Top priorities
              </p>
              <ul className="space-y-1.5 text-sm text-mist-200">
                {report.topPriorities.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {report.categories.map((c) => (
              <CategoryCard key={c.category} category={c} />
            ))}
          </div>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="rounded-full bg-volt-500 px-6 py-2.5 text-sm font-bold text-ink-950 transition hover:bg-volt-400"
            >
              Analyze another session
            </button>
            <Link
              to="/dashboard"
              className="rounded-full border border-ink-600 px-6 py-2.5 text-center text-sm font-semibold text-mist-200 transition hover:border-mist-400"
            >
              View progress dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function CameraIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 8a2 2 0 0 1 2-2h2l1.2-1.6A2 2 0 0 1 10.8 3.6h2.4a2 2 0 0 1 1.6.8L16 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
