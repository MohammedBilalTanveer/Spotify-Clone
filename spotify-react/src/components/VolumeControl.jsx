import { player } from '../player/player'
import { usePlayer } from '../player/usePlayer'
import { VolumeHighIcon, VolumeLowIcon, VolumeOffIcon } from './Icons'
import Slider from './Slider'

export default function VolumeControl() {
  const volume = usePlayer((s) => s.volume)
  const muted = usePlayer((s) => s.muted)
  const level = muted ? 0 : volume
  const Icon = level === 0 ? VolumeOffIcon : level < 0.5 ? VolumeLowIcon : VolumeHighIcon

  return (
    <div className="volume">
      <button
        type="button"
        className="ctrl"
        onClick={() => player.toggleMute()}
        aria-label={level === 0 ? 'Unmute' : 'Mute'}
        title={`${level === 0 ? 'Unmute' : 'Mute'} (M)`}
      >
        <Icon />
      </button>
      <Slider
        className="volume__slider"
        value={level}
        max={1}
        step={0.05}
        label="Volume"
        valueText={`${Math.round(level * 100)}%`}
        onChange={(v) => player.setVolume(v)}
        onCommit={(v) => player.setVolume(v)}
      />
    </div>
  )
}
