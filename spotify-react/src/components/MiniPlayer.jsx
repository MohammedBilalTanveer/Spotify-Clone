import { useDominantColor } from '../hooks/useDominantColor'
import { player } from '../player/player'
import { useCurrentTrack, usePlayer } from '../player/usePlayer'
import Cover from './Cover'
import { NextIcon, PauseIcon, PlayIcon } from './Icons'

/** Compact player above the bottom nav on phones. Tap it to open the full player. */
export default function MiniPlayer({ onExpand }) {
  const { playlist, track } = useCurrentTrack()
  const isPlaying = usePlayer((s) => s.isPlaying)
  const color = useDominantColor(playlist?.cover)

  if (!track) return null

  return (
    <div className="mini-player" style={{ '--mini-color': color }}>
      <button
        type="button"
        className="mini-player__open"
        onClick={onExpand}
        aria-label={`Now playing: ${track.title} by ${track.artist}. Open player`}
      >
        <Cover src={playlist.cover} className="mini-player__cover" size={40} loading="eager" />
        <span className="mini-player__text">
          <span className="mini-player__title">{track.title}</span>
          <span className="mini-player__artist">{track.artist}</span>
        </span>
      </button>
      <button
        type="button"
        className="icon-btn mini-player__btn"
        onClick={() => player.togglePlay()}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
      <button type="button" className="icon-btn mini-player__btn" onClick={() => player.next()} aria-label="Next song">
        <NextIcon />
      </button>
      <MiniProgress />
    </div>
  )
}

function MiniProgress() {
  const currentTime = usePlayer((s) => s.currentTime)
  const duration = usePlayer((s) => s.duration)
  const progress = duration ? Math.min(1, currentTime / duration) : 0
  return (
    <div className="mini-player__progress" aria-hidden="true">
      <span style={{ transform: `scaleX(${progress})` }} />
    </div>
  )
}
