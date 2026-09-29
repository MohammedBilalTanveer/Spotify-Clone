import { formatTime } from '../lib/format'
import { player } from '../player/player'
import { usePlayer } from '../player/usePlayer'
import Cover from './Cover'
import Equalizer from './Equalizer'
import { ClockIcon, PauseIcon, PlayIcon } from './Icons'

/**
 * Song table. `items` is a list of { track, index, playlist }, where `index`
 * is the song's position inside `playlist` (so search results can play from
 * the right playlist).
 */
export default function TrackList({ items, showPlaylist = false, showCover = false }) {
  return (
    <div className={`tracklist${showPlaylist ? ' tracklist--wide' : ''}`}>
      <div className="tracklist__head" aria-hidden="true">
        <span className="tracklist__num">#</span>
        <span>Title</span>
        {showPlaylist && <span className="tracklist__playlist-col">Playlist</span>}
        <span className="tracklist__dur">
          <ClockIcon />
        </span>
      </div>
      <ol className="tracklist__rows">
        {items.map((item, i) => (
          <TrackRow
            key={item.track.id}
            {...item}
            position={i + 1}
            showPlaylist={showPlaylist}
            showCover={showCover}
          />
        ))}
      </ol>
    </div>
  )
}

function TrackRow({ track, index, playlist, position, showPlaylist, showCover }) {
  const isCurrent = usePlayer((s) => s.playlistId === playlist.id && s.index === index)
  const isPlaying = usePlayer((s) => s.isPlaying)
  const playing = isCurrent && isPlaying

  return (
    <li>
      <button
        type="button"
        className={`track${isCurrent ? ' is-current' : ''}`}
        onClick={() => player.playTrack(playlist.id, index)}
        aria-label={`${playing ? 'Pause' : 'Play'} ${track.title} by ${track.artist}`}
        aria-current={isCurrent || undefined}
      >
        <span className="track__index">
          {playing ? <Equalizer /> : <span className="track__num">{position}</span>}
          <span className="track__hover-icon">{playing ? <PauseIcon /> : <PlayIcon />}</span>
        </span>
        <span className="track__main">
          {showCover && <Cover src={playlist.cover} className="track__cover" size={40} />}
          <span className="track__text">
            <span className="track__title">{track.title}</span>
            <span className="track__artist">{track.artist}</span>
          </span>
        </span>
        {showPlaylist && <span className="track__playlist">{playlist.title}</span>}
        <span className="track__duration">{track.duration ? formatTime(track.duration) : '–'}</span>
      </button>
    </li>
  )
}
