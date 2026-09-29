import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import Cover from '../components/Cover'
import { CloseIcon, SearchIcon } from '../components/Icons'
import PlaylistCard from '../components/PlaylistCard'
import TrackList from '../components/TrackList'
import { playlists } from '../data/library'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { usePageColor } from '../lib/pageColor'
import { searchLibrary } from '../lib/search'

const TILE_COLORS = ['#e13300', '#1e3264', '#8d67ab', '#148a08', '#e8115b', '#477d95', '#ba5d07', '#27856a']

export default function Search() {
  usePageColor(null)
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const results = useMemo(() => searchLibrary(query), [query])
  // Don't pop up the on-screen keyboard on phones - only autofocus with a mouse/trackpad.
  const finePointer = useMediaQuery('(pointer: fine)')

  const setQuery = (value) => setParams(value ? { q: value } : {}, { replace: true })
  const hasQuery = query.trim().length > 0
  const noResults = hasQuery && !results.songs.length && !results.playlists.length

  return (
    <div className="page search-page">
      <form
        role="search"
        className="search-box"
        onSubmit={(e) => {
          e.preventDefault()
          e.currentTarget.querySelector('input')?.blur()
        }}
      >
        <SearchIcon className="search-box__icon" />
        <input
          id="search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to listen to?"
          aria-label="Search songs and playlists"
          autoComplete="off"
          enterKeyHint="search"
          autoFocus={finePointer}
        />
        {query && (
          <button type="button" className="search-box__clear" onClick={() => setQuery('')} aria-label="Clear search">
            <CloseIcon />
          </button>
        )}
      </form>

      {!hasQuery && <BrowseAll />}

      {noResults && (
        <div className="empty-state">
          <h2>No results found for "{query.trim()}"</h2>
          <p>Please make sure your words are spelled correctly, or use fewer or different keywords.</p>
        </div>
      )}

      {results.songs.length > 0 && (
        <section className="section" aria-labelledby="songs-heading">
          <h2 id="songs-heading" className="section__title">
            Songs
          </h2>
          <TrackList items={results.songs} showPlaylist showCover />
        </section>
      )}

      {results.playlists.length > 0 && (
        <section className="section" aria-labelledby="search-playlists-heading">
          <h2 id="search-playlists-heading" className="section__title">
            Playlists
          </h2>
          <div className="card-grid">
            {results.playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function BrowseAll() {
  return (
    <section className="section" aria-labelledby="browse-heading">
      <h2 id="browse-heading" className="section__title">
        Browse all
      </h2>
      <div className="browse-grid">
        {playlists.map((playlist, i) => (
          <Link
            key={playlist.id}
            to={`/playlist/${playlist.id}`}
            className="browse-tile"
            style={{ '--tile-color': TILE_COLORS[i % TILE_COLORS.length] }}
          >
            <span className="browse-tile__title">{playlist.title}</span>
            <Cover src={playlist.cover} className="browse-tile__cover" size={100} />
          </Link>
        ))}
      </div>
    </section>
  )
}
