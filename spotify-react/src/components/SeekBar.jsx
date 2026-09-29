import { useState } from 'react'
import { formatTime } from '../lib/format'
import { player } from '../player/player'
import { usePlayer } from '../player/usePlayer'
import Slider from './Slider'

/** Elapsed time, draggable progress bar and total time. */
export default function SeekBar({ stacked = false }) {
  const currentTime = usePlayer((s) => s.currentTime)
  const duration = usePlayer((s) => s.duration)
  const [scrubTime, setScrubTime] = useState(null)
  const shown = scrubTime ?? currentTime

  return (
    <div className={`seekbar${stacked ? ' seekbar--stacked' : ''}`}>
      <span className="seekbar__time seekbar__time--current">{formatTime(shown)}</span>
      <Slider
        className="seekbar__slider"
        value={shown}
        max={duration || 0}
        step={5}
        label="Song progress"
        valueText={`${formatTime(shown)} of ${formatTime(duration)}`}
        disabled={!duration}
        onChange={setScrubTime}
        onCommit={(time) => {
          setScrubTime(null)
          player.seek(time)
        }}
      />
      <span className="seekbar__time seekbar__time--total">{formatTime(duration)}</span>
    </div>
  )
}
