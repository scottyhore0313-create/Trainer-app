export function captureThumbnail(video: HTMLVideoElement, maxWidth = 240): string {
  const canvas = document.createElement('canvas')
  const scale = Math.min(1, maxWidth / (video.videoWidth || maxWidth))
  canvas.width = Math.max(1, Math.round((video.videoWidth || maxWidth) * scale))
  canvas.height = Math.max(1, Math.round((video.videoHeight || maxWidth) * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.6)
}
