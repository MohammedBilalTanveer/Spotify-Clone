import { allTracks, playlists } from '../data/library'

const normalize = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

/** Every word of the query must appear somewhere in the item (case- and accent-insensitive). */
export function searchLibrary(query) {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (!terms.length) return { songs: [], playlists: [] }

  const matches = (text) => {
    const haystack = normalize(text)
    return terms.every((term) => haystack.includes(term))
  }

  return {
    songs: allTracks.filter(({ track, playlist }) =>
      matches(`${track.title} ${track.artist} ${playlist.title}`),
    ),
    playlists: playlists.filter((playlist) =>
      matches(`${playlist.title} ${playlist.description} ${playlist.owner}`),
    ),
  }
}
