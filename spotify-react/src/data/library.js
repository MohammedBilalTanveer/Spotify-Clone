// library.json is generated from public/songs by scripts/generate-library.mjs.
import data from './library.json'

/** Playlist loaded (paused) on a visitor's first visit. Falls back to the first playlist with songs. */
export const DEFAULT_PLAYLIST_ID = 'ncs'

export const playlists = data.playlists

const byId = new Map(playlists.map((playlist) => [playlist.id, playlist]))

export const getPlaylist = (id) => byId.get(id) ?? null

export function getDefaultPlaylist() {
  const preferred = getPlaylist(DEFAULT_PLAYLIST_ID)
  if (preferred?.tracks.length) return preferred
  return playlists.find((playlist) => playlist.tracks.length) ?? null
}

/** Every song in the library, with the playlist it belongs to and its position there. */
export const allTracks = playlists.flatMap((playlist) =>
  playlist.tracks.map((track, index) => ({ track, index, playlist })),
)

export const totalDuration = (playlist) =>
  playlist.tracks.reduce((sum, track) => sum + (track.duration || 0), 0)
