import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { useDominantColor } from '../hooks/useDominantColor'
import { useCurrentTrack } from '../player/usePlayer'
import Controls from './Controls'
import Cover from './Cover'
import { ChevronDownIcon, QueueIcon } from './Icons'
import SeekBar from './SeekBar'

/** Full-screen player on phones. Close with the arrow, Escape, or a swipe down. */
export default function NowPlaying({ open, onClose }) {
  const { playlist, track } = useCurrentTrack()
  const color = useDominantColor(playlist?.cover)
  const closeRef = useRef(null)
  const touchStart = useRef(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    touchStart.current = e.target.closest('.slider') ? null : { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = (e) => {
    if (!touchStart.current) return
    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStart.current.x
    const dy = touch.clientY - touchStart.current.y
    touchStart.current = null
    if (dy > 90 && dy > Math.abs(dx) * 1.5) onClose()
  }

  return (
    <div
      className={`now-playing${open ? ' is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Now playing"
      inert={!open}
      style={{ '--np-color': color }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <header className="now-playing__header">
        <button ref={closeRef} type="button" className="icon-btn" onClick={onClose} aria-label="Close player">
          <ChevronDownIcon />
        </button>
        <div className="now-playing__context">
          <span>Playing from playlist</span>
          <strong>{playlist?.title ?? '—'}</strong>
        </div>
        {playlist ? (
          <Link
            to={`/playlist/${playlist.id}`}
            className="icon-btn"
            onClick={onClose}
            aria-label={`Open ${playlist.title}`}
          >
            <QueueIcon />
          </Link>
        ) : (
          <span />
        )}
      </header>

      <div className="now-playing__body">
        <Cover
          src={playlist?.cover}
          alt={playlist ? `${playlist.title} cover` : ''}
          className="now-playing__cover"
          loading="eager"
        />
        <div className="now-playing__meta">
          <h2 className="now-playing__title">{track?.title ?? 'Nothing playing'}</h2>
          <p className="now-playing__artist">{track?.artist ?? ''}</p>
        </div>
        <SeekBar stacked />
        <Controls size="lg" />
      </div>
    </div>
  )
}
