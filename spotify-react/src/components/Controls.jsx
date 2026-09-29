import { player } from '../player/player'
import { usePlayer } from '../player/usePlayer'
import { NextIcon, PauseIcon, PlayIcon, PrevIcon, RepeatIcon, RepeatOneIcon, ShuffleIcon } from './Icons'

const REPEAT_LABEL = { off: 'Repeat: off', all: 'Repeat: all', one: 'Repeat: one song' }

/** Shuffle / previous / play-pause / next / repeat */
export default function Controls({ size = 'md' }) {
  const isPlaying = usePlayer((s) => s.isPlaying)
  const isBuffering = usePlayer((s) => s.isBuffering)
  const shuffle = usePlayer((s) => s.shuffle)
  const repeat = usePlayer((s) => s.repeat)
  const hasTrack = usePlayer((s) => s.index >= 0)

  return (
    <div className={`controls controls--${size}`}>
      <button
        type="button"
        className={`ctrl${shuffle ? ' is-active' : ''}`}
        onClick={() => player.toggleShuffle()}
        aria-label="Shuffle"
        aria-pressed={shuffle}
        title="Shuffle (S)"
      >
        <ShuffleIcon />
      </button>
      <button
        type="button"
        className="ctrl"
        onClick={() => player.prev()}
        disabled={!hasTrack}
        aria-label="Previous song"
        title="Previous (Shift + ←)"
      >
        <PrevIcon />
      </button>
      <button
        type="button"
        className={`ctrl ctrl--play${isPlaying && isBuffering ? ' is-buffering' : ''}`}
        onClick={() => player.togglePlay()}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        title={`${isPlaying ? 'Pause' : 'Play'} (Space)`}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
      <button
        type="button"
        className="ctrl"
        onClick={() => player.next()}
        disabled={!hasTrack}
        aria-label="Next song"
        title="Next (Shift + →)"
      >
        <NextIcon />
      </button>
      <button
        type="button"
        className={`ctrl${repeat !== 'off' ? ' is-active' : ''}`}
        onClick={() => player.cycleRepeat()}
        aria-label={REPEAT_LABEL[repeat]}
        title="Repeat (R)"
      >
        {repeat === 'one' ? <RepeatOneIcon /> : <RepeatIcon />}
      </button>
    </div>
  )
}
