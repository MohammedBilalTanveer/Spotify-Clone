import { Link, useNavigate } from 'react-router'
import { useHistoryNav } from '../hooks/useHistoryNav'
import { toast } from '../lib/toast'
import { ChevronLeftIcon, ChevronRightIcon, MenuIcon, SpotifyIcon } from './Icons'

const showDemoNotice = () => toast("This is a demo clone - accounts aren't available")

export default function Topbar({ scrolled, showMenu, onOpenMenu }) {
  const navigate = useNavigate()
  const { canGoBack, canGoForward } = useHistoryNav()

  return (
    <header className={`topbar${scrolled ? ' is-scrolled' : ''}`}>
      <div className="topbar__left">
        {showMenu && (
          <button
            type="button"
            className="icon-btn topbar__menu"
            onClick={onOpenMenu}
            aria-label="Open library"
            aria-controls="sidebar"
          >
            <MenuIcon />
          </button>
        )}
        <Link to="/" className="topbar__logo" aria-label="Home">
          <SpotifyIcon />
        </Link>
        <button
          type="button"
          className="nav-arrow"
          onClick={() => navigate(-1)}
          disabled={!canGoBack}
          aria-label="Go back"
        >
          <ChevronLeftIcon />
        </button>
        <button
          type="button"
          className="nav-arrow"
          onClick={() => navigate(1)}
          disabled={!canGoForward}
          aria-label="Go forward"
        >
          <ChevronRightIcon />
        </button>
      </div>

      <div className="topbar__right">
        <button type="button" className="btn btn--ghost" onClick={showDemoNotice}>
          Sign up
        </button>
        <button type="button" className="btn btn--light" onClick={showDemoNotice}>
          Log in
        </button>
      </div>
    </header>
  )
}
