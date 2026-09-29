import { Link } from 'react-router'
import { useCurrentTrack } from '../player/usePlayer'
import Controls from './Controls'
import Cover from './Cover'
import SeekBar from './SeekBar'
import VolumeControl from './VolumeControl'

/** Bottom player on tablet and desktop. */
export default function PlayerBar() {
  const { playlist, track } = useCurrentTrack()

  return (
    <footer className="player-bar" aria-label="Now playing">
      <div className="player-bar__song">
        {track && (
          <>
            <Link to={`/playlist/${playlist.id}`} className="player-bar__cover-link" aria-label={`Open ${playlist.title}`}>
              <Cover src={playlist.cover} className="player-bar__cover" size={56} loading="eager" />
            </Link>
            <div className="player-bar__text">
              <Link to={`/playlist/${playlist.id}`} className="player-bar__title">
                {track.title}
              </Link>
              <span className="player-bar__artist">{track.artist}</span>
            </div>
          </>
        )}
      </div>
      <div className="player-bar__center">
        <Controls />
        <SeekBar />
      </div>
      <div className="player-bar__extra">
        <VolumeControl />
      </div>
    </footer>
  )
}
