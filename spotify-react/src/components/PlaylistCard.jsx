import { Link } from 'react-router'
import Cover from './Cover'
import PlayButton from './PlayButton'

/** Card in the "Spotify Playlists" grid. The whole card links to the playlist; the green button plays it. */
export default function PlaylistCard({ playlist }) {
  return (
    <article className="card">
      <div className="card__cover">
        <Cover src={playlist.cover} className="card__image" size={200} />
        <PlayButton playlist={playlist} className="card__play" />
      </div>
      <h3 className="card__title">
        <Link to={`/playlist/${playlist.id}`} className="card__link">
          {playlist.title}
        </Link>
      </h3>
      <p className="card__desc">{playlist.description || `By ${playlist.owner}`}</p>
    </article>
  )
}
