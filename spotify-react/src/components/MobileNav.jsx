import { NavLink } from 'react-router'
import { HomeIcon, LibraryIcon, SearchIcon } from './Icons'

/** Bottom tab bar on phones. */
export default function MobileNav({ onOpenLibrary, libraryOpen }) {
  return (
    <nav className="mobile-nav" aria-label="Main">
      <NavLink to="/" end>
        <HomeIcon />
        <span>Home</span>
      </NavLink>
      <NavLink to="/search">
        <SearchIcon />
        <span>Search</span>
      </NavLink>
      <button
        type="button"
        className={libraryOpen ? 'active' : ''}
        onClick={onOpenLibrary}
        aria-controls="sidebar"
        aria-expanded={libraryOpen}
      >
        <LibraryIcon />
        <span>Your Library</span>
      </button>
    </nav>
  )
}
