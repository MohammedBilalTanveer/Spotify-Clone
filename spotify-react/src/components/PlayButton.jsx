import { player } from '../player/player'
import { usePlayer } from '../player/usePlayer'
import { PauseIcon, PlayIcon } from './Icons'

/** Green circular play/pause button for a whole playlist. */
export default function PlayButton({ playlist, size = 'md', className = '' }) {
  const isActive = usePlayer((s) => s.playlistId === playlist.id)
  const isPlaying = usePlayer((s) => s.isPlaying)
  const playing = isActive && isPlaying

  return (
    <button
      type="button"
      className={`play-btn play-btn--${size}${playing ? ' is-playing' : ''} ${className}`}
      aria-label={`${playing ? 'Pause' : 'Play'} ${playlist.title}`}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        player.togglePlaylist(playlist.id)
      }}
    >
      {playing ? <PauseIcon /> : <PlayIcon />}
    </button>
  )
}
