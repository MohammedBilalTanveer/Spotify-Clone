import { useState } from 'react'
import { Link } from 'react-router'
import Cover from '../components/Cover'
import PlayButton from '../components/PlayButton'
import PlaylistCard from '../components/PlaylistCard'
import { getDefaultPlaylist, playlists } from '../data/library'
import { useDominantColor } from '../hooks/useDominantColor'
import { greeting } from '../lib/format'
import { usePageColor } from '../lib/pageColor'

export default function Home() {
  // Like Spotify, the header gradient follows the quick-pick tile you hover.
  const [hovered, setHovered] = useState(null)
  const color = useDominantColor((hovered ?? getDefaultPlaylist() ?? playlists[0])?.cover)
  usePageColor(color)

  return (
    <div className="page home">
      <h1 className="home__greeting">{greeting()}</h1>

      {playlists.length > 0 ? (
        <>
          <div className="quick-grid">
            {playlists.slice(0, 8).map((playlist) => (
              <QuickTile key={playlist.id} playlist={playlist} onHover={setHovered} />
            ))}
          </div>

          <section className="section" aria-labelledby="playlists-heading">
            <h2 id="playlists-heading" className="section__title">
              Spotify Playlists
            </h2>
            <div className="card-grid">
              {playlists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          </section>
        </>
      ) : (
        <p className="empty-note">No playlists yet. Add a folder to public/songs to get started.</p>
      )}
    </div>
  )
}

function QuickTile({ playlist, onHover }) {
  return (
    <div
      className="quick-tile"
      onMouseEnter={() => onHover(playlist)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(playlist)}
      onBlur={() => onHover(null)}
    >
      <Cover src={playlist.cover} className="quick-tile__cover" size={64} />
      <Link to={`/playlist/${playlist.id}`} className="quick-tile__link">
        {playlist.title}
      </Link>
      <PlayButton playlist={playlist} size="sm" className="quick-tile__play" />
    </div>
  )
}
