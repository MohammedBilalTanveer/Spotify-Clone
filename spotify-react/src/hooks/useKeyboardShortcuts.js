import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { player } from '../player/player'

/**
 * Space        play / pause
 * ← / →        seek 5 seconds
 * Shift + ← →  previous / next song
 * M  mute   S  shuffle   R  repeat   /  search
 */
export function useKeyboardShortcuts() {
  const navigate = useNavigate()

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return
      const target = e.target instanceof Element ? e.target : null
      if (target?.closest('input, textarea, select, [contenteditable="true"], [role="slider"]')) return
      const onControl = target?.closest('button, a, [role="button"]')

      switch (e.key) {
        case ' ':
          if (onControl) return // let the focused button handle Space itself
          player.togglePlay()
          break
        case 'ArrowRight':
          if (e.shiftKey) player.next()
          else player.seekBy(5)
          break
        case 'ArrowLeft':
          if (e.shiftKey) player.prev()
          else player.seekBy(-5)
          break
        case 'm':
        case 'M':
          player.toggleMute()
          break
        case 's':
        case 'S':
          player.toggleShuffle()
          break
        case 'r':
        case 'R':
          player.cycleRepeat()
          break
        case '/':
          navigate('/search')
          requestAnimationFrame(() => document.getElementById('search-input')?.focus())
          break
        default:
          return
      }
      e.preventDefault()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate])
}
