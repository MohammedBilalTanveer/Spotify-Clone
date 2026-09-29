import { useSyncExternalStore } from 'react'
import { player, getCurrent } from './player'

/**
 * Subscribe to one slice of player state. The component only re-renders when
 * the selected value changes, so return primitives (or stable references).
 *
 *   const isPlaying = usePlayer((s) => s.isPlaying)
 */
export function usePlayer(selector) {
  return useSyncExternalStore(player.subscribe, () => selector(player.getState()))
}

/** The playlist and song that are currently loaded (or nulls). */
export function useCurrentTrack() {
  const playlistId = usePlayer((s) => s.playlistId)
  const index = usePlayer((s) => s.index)
  return getCurrent({ playlistId, index })
}
