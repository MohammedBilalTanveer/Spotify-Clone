import { Link } from 'react-router'
import { SpotifyIcon } from '../components/Icons'
import { usePageColor } from '../lib/pageColor'

export default function NotFound() {
  usePageColor(null)
  return (
    <div className="page not-found">
      <SpotifyIcon className="not-found__icon" />
      <h1>Page not found</h1>
      <p>We can't seem to find the page you are looking for.</p>
      <Link to="/" className="btn btn--light">
        Home
      </Link>
    </div>
  )
}
