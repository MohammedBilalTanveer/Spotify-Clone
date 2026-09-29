import { createContext, useContext, useEffect } from 'react'

export const DEFAULT_PAGE_COLOR = '#121212'

/** Lets a page tint the gradient behind the top bar and page header. */
export const PageColorContext = createContext(() => {})

export function usePageColor(color) {
  const setColor = useContext(PageColorContext)
  useEffect(() => {
    setColor(color || DEFAULT_PAGE_COLOR)
  }, [color, setColor])
}
