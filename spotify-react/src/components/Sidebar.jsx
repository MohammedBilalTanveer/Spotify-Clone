import { Link, NavLink } from 'react-router'
import { getPlaylist, playlists } from '../data/library'
import { pluralize } from '../lib/format'
import { player } from '../player/player'
import { usePlayer } from '../player/usePlayer'
import Cover from './Cover'
import Equalizer from './Equalizer'
import {
  CloseIcon,
  HomeIcon,
  LibraryIcon,
  MusicIcon,
  PauseIcon,
  PlayIcon,
  SearchIcon,
  VolumeHighIcon,
  Wordmark,
} from './Icons'

const FOOTER_LINKS = [
  ['Legal', 'https://www.spotify.com/in-en/legal/'],
  ['Security', 'https://www.spotify.com/in-en/safetyandprivacy/'],
  ['Privacy', 'https://www.spotify.com/in-en/legal/privacy-policy/'],
  ['Cookies', 'https://www.spotify.com/in-en/legal/cookies-policy/'],
  ['About us', 'https://www.spotify.com/in-en/legal/privacy-policy/#s3'],
  ['Accessibility', 'https://www.spotify.com/in-en/accessibility/'],
]

/**
 * Left column on desktop; a slide-in drawer (hamburger / "Your Library") on
 * tablets and phones.
 */
export default function Sidebar({ isDrawer, open, onClose }) {
  return (
    <>
      <aside
        id="sidebar"
        className={`sidebar${open ? ' is-open' : ''}`}
        aria-label="Sidebar"
        inert={isDrawer && !open}
      >
        <div className="panel sidebar__top">
          <div className="sidebar__brand">
            <Link to="/" className="sidebar__logo-link">
              <Wordmark className="sidebar__logo" />
            </Link>
            {isDrawer && (
              <button type="button" className="icon-btn" onClick={onClose} aria-label="Close library">
                <CloseIcon />
              </button>
            )}
          </div>
          <nav className="side-nav" aria-label="Main">
            <NavLink to="/" end>
              <HomeIcon />
              Home
            </NavLink>
            <NavLink to="/search">
              <SearchIcon />
              Search
            </NavLink>
          </nav>
        </div>

        <section className="panel library" aria-labelledby="library-title">
          <header className="library__header">
            <LibraryIcon />
            <h2 id="library-title">Your Library</h2>
          </header>

          <div className="library__scroll">
            <ul className="library__playlists">
              {playlists.map((playlist) => (
                <PlaylistItem key={playlist.id} playlist={playlist} />
              ))}
            </ul>
            <CurrentSongs />
          </div>

          <footer className="library__footer">
            <ul>
              {FOOTER_LINKS.map(([label, href]) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noreferrer">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="library__credit">A clone made by Bilal for learning. Not affiliated with Spotify.</p>
          </footer>
        </section>
      </aside>

      {isDrawer && (
        <div className={`backdrop${open ? ' is-visible' : ''}`} onClick={onClose} aria-hidden="true" />
      )}
    </>
  )
}

function PlaylistItem({ playlist }) {
  const isActive = usePlayer((s) => s.playlistId === playlist.id)
  const isPlaying = usePlayer((s) => s.isPlaying)

  return (
    <li>
      <NavLink
        to={`/playlist/${playlist.id}`}
        className={`library__item${isActive ? ' is-loaded' : ''}`}
      >
        <Cover src={playlist.cover} className="library__item-cover" size={48} />
        <span className="library__item-text">
          <span className="library__item-title">{playlist.title}</span>
          <span className="library__item-sub">Playlist · {pluralize(playlist.tracks.length, 'song')}</span>
        </span>
        {isActive && isPlaying && <VolumeHighIcon className="library__item-icon" />}
      </NavLink>
    </li>
  )
}

/** Songs of the playlist that's loaded in the player, each with "Play Now" (from the original design). */
function CurrentSongs() {
  const playlistId = usePlayer((s) => s.playlistId)
  const index = usePlayer((s) => s.index)
  const isPlaying = usePlayer((s) => s.isPlaying)
  const playlist = getPlaylist(playlistId)

  if (!playlist) return null

  return (
    <section className="library__songs" aria-labelledby="current-songs-title">
      <h3 id="current-songs-title">
        <span>Songs in</span> {playlist.title}
      </h3>
      <ol>
        {playlist.tracks.map((track, i) => {
          const isCurrent = i === index
          const playing = isCurrent && isPlaying
          return (
            <li key={track.id}>
              <button
                type="button"
                className={`song-item${isCurrent ? ' is-current' : ''}`}
                onClick={() => player.playTrack(playlist.id, i)}
                aria-label={`${playing ? 'Pause' : 'Play'} ${track.title} by ${track.artist}`}
              >
                {playing ? <Equalizer className="song-item__icon" /> : <MusicIcon className="song-item__icon" />}
                <span className="song-item__info">
                  <span className="song-item__title">{track.title}</span>
                  <span className="song-item__artist">{track.artist}</span>
                </span>
                <span className="song-item__action">
                  <span>{playing ? 'Pause' : 'Play Now'}</span>
                  {playing ? <PauseIcon /> : <PlayIcon />}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
