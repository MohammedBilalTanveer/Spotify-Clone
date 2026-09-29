import { useEffect, useState } from 'react'

const FALLBACK = '#535353'
const cache = new Map()

// Averages the cover's pixels (weighted towards vivid ones) and darkens the
// result so white text stays readable on top of it - like Spotify's headers.
function extractColor(image) {
  const size = 32
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(image, 0, 0, size, size)
  const { data } = ctx.getImageData(0, 0, size, size)

  let r = 0
  let g = 0
  let b = 0
  let total = 0
  for (let i = 0; i < data.length; i += 4) {
    const max = Math.max(data[i], data[i + 1], data[i + 2])
    const min = Math.min(data[i], data[i + 1], data[i + 2])
    const saturation = max ? (max - min) / max : 0
    const weight = 0.05 + saturation * saturation * (max / 255)
    r += data[i] * weight
    g += data[i + 1] * weight
    b += data[i + 2] * weight
    total += weight
  }
  r /= total
  g /= total
  b /= total

  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  const scale = luminance > 0.42 ? 0.42 / luminance : 1
  return '#' + [r, g, b].map((c) => Math.round(c * scale).toString(16).padStart(2, '0')).join('')
}

/** Returns a background color taken from an image (cached per image URL). */
export function useDominantColor(src, fallback = FALLBACK) {
  const [result, setResult] = useState({ src: null, color: null })

  useEffect(() => {
    if (!src || cache.has(src)) return
    let cancelled = false
    const image = new Image()
    image.onload = () => {
      let color = fallback
      try {
        color = extractColor(image)
      } catch {
        // Canvas can be blocked (e.g. cross-origin images) - keep the fallback.
      }
      cache.set(src, color)
      if (!cancelled) setResult({ src, color })
    }
    image.src = src
    return () => {
      cancelled = true
    }
  }, [src, fallback])

  if (!src) return fallback
  return cache.get(src) ?? (result.src === src ? result.color : fallback)
}
