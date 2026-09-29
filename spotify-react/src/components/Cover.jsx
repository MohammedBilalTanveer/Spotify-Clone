import { useState } from 'react'
import { MusicIcon } from './Icons'

/** Playlist artwork with a music-note placeholder when there's no cover (or it fails to load). */
export default function Cover({ src, alt = '', className = '', size, loading = 'lazy' }) {
  const [failedSrc, setFailedSrc] = useState(null)

  if (!src || failedSrc === src) {
    return (
      <div
        className={`cover cover--empty ${className}`}
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
      >
        <MusicIcon />
      </div>
    )
  }

  return (
    <img
      className={`cover ${className}`}
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading={loading}
      decoding="async"
      draggable="false"
      onError={() => setFailedSrc(src)}
    />
  )
}
