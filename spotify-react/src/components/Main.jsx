import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { DEFAULT_PAGE_COLOR, PageColorContext } from '../lib/pageColor'
import Topbar from './Topbar'

/** The scrollable content area: sticky top bar + the current page. */
export default function Main({ children, showMenu, onOpenMenu }) {
  const ref = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const [pageColor, setPageColor] = useState(DEFAULT_PAGE_COLOR)
  const { pathname } = useLocation()

  // Start every page at the top.
  useEffect(() => {
    ref.current?.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <PageColorContext.Provider value={setPageColor}>
      <main
        id="main"
        ref={ref}
        className="main"
        tabIndex={-1}
        style={{ '--page-color': pageColor }}
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 16)}
      >
        <div className="main__inner">
          <Topbar scrolled={scrolled} showMenu={showMenu} onOpenMenu={onOpenMenu} />
          <div className="main__content">{children}</div>
        </div>
      </main>
    </PageColorContext.Provider>
  )
}
