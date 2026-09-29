import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import Cover from '../components/Cover'
import { MusicIcon, ShuffleIcon, SpotifyIcon } from '../components/Icons'
import PlayButton from '../components/PlayButton'
import TrackList from '../components/TrackList'
import { getPlaylist, totalDuration } from '../data/library'
import { useDominantColor } from '../hooks/useDominantColor'
import { formatDuration, pluralize } from '../lib/format'
import { usePageColor } from '../lib/pageColor'
import { player } from '../player/player'
import { usePlayer } from '../player/usePlayer'
import NotFound from './NotFound'

export default function PlaylistPage() {
  const { id } = useParams()
  const playlist = getPlaylist(id)
  const color = useDominantColor(playlist?.cover)
  usePageColor(playlist ? color : null)
  const shuffle = usePlayer((s) => s.shuffle)

  const items = useMemo(
    () => playlist?.tracks.map((track, index) => ({ track, index, playlist })) ?? [],
    [playlist],
  )

  if (!playlist) return <NotFound />

  const count = playlist.tracks.length
  const total = totalDuration(playlist)

  return (
    <div className="playlist-page">
      <header className="hero">
        <Cover
          key={playlist.id} // new <img> per playlist, so the previous cover never lingers while loading
          src={playlist.cover}
          alt={`${playlist.title} cover`}
          className="hero__cover"
          size={232}
          loading="eager"
        />
        <div className="hero__info">
          <span className="hero__type">Playlist</span>
          <h1 className={`hero__title${playlist.title.length > 16 ? ' hero__title--long' : ''}`}>
            {playlist.title}
          </h1>
          {playlist.description && <p className="hero__desc">{playlist.description}</p>}
          <p className="hero__meta">
            <SpotifyIcon className="hero__owner-icon" />
            <strong>{playlist.owner}</strong>
            <span aria-hidden="true">•</span>
            <span>
              {pluralize(count, 'song')}
              {total > 0 && <span className="hero__length">, {formatDuration(total)}</span>}
            </span>
          </p>
        </div>
      </header>

      <div className="playlist-page__body">
        <div className="action-bar">
          <PlayButton playlist={playlist} size="lg" />
          <button
            type="button"
            className={`ctrl ctrl--lg${shuffle ? ' is-active' : ''}`}
            onClick={() => player.toggleShuffle()}
            aria-label="Shuffle"
            aria-pressed={shuffle}
            title="Shuffle (S)"
          >
            <ShuffleIcon />
          </button>
        </div>

        {count > 0 ? (
          <TrackList items={items} />
        ) : (
          <div className="empty-state">
            <MusicIcon className="empty-state__icon" />
            <h2>Songs coming soon</h2>
            <p>This playlist doesn't have any songs yet.</p>
            <Link to="/" className="btn btn--light">
              Browse other playlists
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
