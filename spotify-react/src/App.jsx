import { useCallback, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import Main from './components/Main'
import MiniPlayer from './components/MiniPlayer'
import MobileNav from './components/MobileNav'
import NowPlaying from './components/NowPlaying'
import PlayerBar from './components/PlayerBar'
import Sidebar from './components/Sidebar'
import Toaster from './components/Toaster'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { DRAWER_QUERY, MOBILE_QUERY, useMediaQuery } from './hooks/useMediaQuery'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import PlaylistPage from './pages/Playlist'
import Search from './pages/Search'
import { useCurrentTrack, usePlayer } from './player/usePlayer'

const DEFAULT_TITLE = 'Spotify – Web Player'

export default function App() {
  const isDrawer = useMediaQuery(DRAWER_QUERY)
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false)
  const { pathname } = useLocation()

  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const closeNowPlaying = useCallback(() => setNowPlayingOpen(false), [])

  // Close the drawer after navigating, and when the screen grows past the drawer breakpoint.
  useEffect(() => setDrawerOpen(false), [pathname, isDrawer])
  useEffect(() => {
    if (!isMobile) setNowPlayingOpen(false)
  }, [isMobile])

  useEffect(() => {
    if (!drawerOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [drawerOpen])

  useKeyboardShortcuts()
  useDocumentTitle()

  return (
    <div className={`app${isMobile ? ' app--mobile' : ''}`}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <Sidebar isDrawer={isDrawer} open={drawerOpen} onClose={closeDrawer} />

      <Main showMenu={isDrawer} onOpenMenu={openDrawer}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/playlist/:id" element={<PlaylistPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Main>

      {isMobile ? (
        <div className="dock">
          <MiniPlayer onExpand={() => setNowPlayingOpen(true)} />
          <MobileNav onOpenLibrary={openDrawer} libraryOpen={drawerOpen} />
        </div>
      ) : (
        <PlayerBar />
      )}

      {isMobile && <NowPlaying open={nowPlayingOpen} onClose={closeNowPlaying} />}

      <Toaster />
    </div>
  )
}

/** Shows the playing song in the browser tab, like Spotify does. */
function useDocumentTitle() {
  const { track } = useCurrentTrack()
  const isPlaying = usePlayer((s) => s.isPlaying)

  useEffect(() => {
    document.title = isPlaying && track ? `${track.title} • ${track.artist}` : DEFAULT_TITLE
  }, [isPlaying, track])
}
