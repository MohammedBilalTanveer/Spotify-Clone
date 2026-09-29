// The music player engine: one shared <audio> element plus a tiny store.
//
// It lives outside React so playback never restarts when components re-render,
// and so actions like play() run synchronously inside click handlers (mobile
// browsers only allow audio to start from a direct user gesture).
// Components read it through the hooks in usePlayer.js.

import { getPlaylist, getDefaultPlaylist } from '../data/library'
import { toast } from '../lib/toast'

const STORAGE_KEY = 'spotify-clone:player'
const REPEAT_MODES = ['off', 'all', 'one']
const RESTART_THRESHOLD = 3 // seconds - "previous" restarts the current song after this point
const DEFAULT_VOLUME = 0.7

const audio = new Audio()
audio.preload = 'metadata'
audio.volume = DEFAULT_VOLUME

let state = {
  playlistId: null,
  index: -1, // index of the current song inside its playlist
  order: [], // play order (indices) - shuffled when shuffle is on
  isPlaying: false,
  isBuffering: false,
  currentTime: 0,
  duration: 0,
  volume: DEFAULT_VOLUME,
  muted: false,
  shuffle: false,
  repeat: 'off', // 'off' | 'all' | 'one'
}

const listeners = new Set()
let loadedSrc = null
let pendingSeek = null
let lastVolume = DEFAULT_VOLUME
let lastPersist = 0

function setState(patch) {
  const changed = Object.keys(patch).some((key) => !Object.is(state[key], patch[key]))
  if (!changed) return
  state = { ...state, ...patch }
  listeners.forEach((listener) => listener())
}

const clamp = (n, min, max) => Math.min(max, Math.max(min, n))
const range = (n) => Array.from({ length: n }, (_, i) => i)
const tracksOf = (playlistId) => getPlaylist(playlistId)?.tracks ?? []

function shuffledOrder(length, first) {
  const rest = range(length).filter((i) => i !== first)
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[rest[i], rest[j]] = [rest[j], rest[i]]
  }
  return first >= 0 && first < length ? [first, ...rest] : rest
}

const makeOrder = (length, first, shuffle) => (shuffle ? shuffledOrder(length, first) : range(length))

function currentOrder() {
  const length = tracksOf(state.playlistId).length
  return state.order.length === length ? state.order : range(length)
}

export function getCurrent(s = state) {
  const playlist = getPlaylist(s.playlistId)
  return { playlist, track: playlist?.tracks[s.index] ?? null }
}

/* ------------------------------------------------------------------ */
/* Persistence - remembers the last song, position, volume and modes  */
/* ------------------------------------------------------------------ */

function persist() {
  const { track } = getCurrent()
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        playlistId: state.playlistId,
        trackId: track?.id ?? null,
        time: Math.floor(audio.currentTime || 0),
        volume: audio.volume,
        muted: audio.muted,
        shuffle: state.shuffle,
        repeat: state.repeat,
      }),
    )
  } catch {
    // Storage can be unavailable (private mode, quota) - the player still works.
  }
}

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? null
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ */
/* Media Session - lock screen / notification / headphone controls   */
/* ------------------------------------------------------------------ */

const mediaSession =
  typeof navigator !== 'undefined' && 'mediaSession' in navigator ? navigator.mediaSession : null

function updateMediaMetadata() {
  if (!mediaSession || typeof MediaMetadata === 'undefined') return
  const { playlist, track } = getCurrent()
  if (!track) return
  mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artist,
    album: playlist.title,
    artwork: playlist.cover ? [{ src: new URL(playlist.cover, location.href).href }] : [],
  })
}

function updatePositionState() {
  if (!mediaSession?.setPositionState || !Number.isFinite(audio.duration)) return
  try {
    mediaSession.setPositionState({
      duration: audio.duration,
      playbackRate: audio.playbackRate,
      position: clamp(audio.currentTime, 0, audio.duration),
    })
  } catch {
    // Some browsers throw on edge values; position is cosmetic.
  }
}

/* ------------------------------------------------------------------ */
/* Actions                                                            */
/* ------------------------------------------------------------------ */

function load(playlistId, index, { autoplay = true, startAt = 0, resetOrder = false } = {}) {
  const tracks = tracksOf(playlistId)
  const track = tracks[index]
  if (!track) return false

  const keepOrder =
    !resetOrder && playlistId === state.playlistId && state.order.length === tracks.length

  setState({
    playlistId,
    index,
    order: keepOrder ? state.order : makeOrder(tracks.length, index, state.shuffle),
    currentTime: startAt,
    duration: track.duration ?? 0,
    isBuffering: false,
  })

  if (loadedSrc === track.src) {
    audio.currentTime = startAt
  } else {
    loadedSrc = track.src
    pendingSeek = startAt > 0 ? startAt : null
    audio.src = track.src
  }

  updateMediaMetadata()
  if (autoplay) play()
  persist()
  return true
}

function play() {
  if (!loadedSrc) {
    const fallback = getDefaultPlaylist()
    return fallback ? load(fallback.id, 0) : false
  }
  // Load errors are reported by the 'error' event; AbortError just means we switched songs.
  audio.play()?.catch(() => {})
  return true
}

function pause() {
  audio.pause()
}

function togglePlay() {
  if (!loadedSrc || audio.paused) play()
  else pause()
}

/** Start a playlist from `index` (or from the top / a random song when shuffling). */
function playPlaylist(playlistId, index) {
  const tracks = tracksOf(playlistId)
  if (!tracks.length) {
    toast('This playlist has no songs yet')
    return false
  }
  const start = index ?? (state.shuffle ? Math.floor(Math.random() * tracks.length) : 0)
  return load(playlistId, start, { resetOrder: true })
}

/** Big green play buttons: pause/resume if this playlist is loaded, otherwise start it. */
function togglePlaylist(playlistId) {
  if (state.playlistId === playlistId && loadedSrc) togglePlay()
  else playPlaylist(playlistId)
}

/** Song rows: clicking the current song toggles it, any other song starts playing. */
function playTrack(playlistId, index) {
  if (state.playlistId === playlistId && state.index === index && loadedSrc) togglePlay()
  else load(playlistId, index, { resetOrder: playlistId !== state.playlistId })
}

function next({ auto = false } = {}) {
  const order = currentOrder()
  if (!order.length) return
  const position = order.indexOf(state.index)

  if (position + 1 < order.length) {
    load(state.playlistId, order[position + 1])
  } else if (state.repeat === 'all' || !auto) {
    load(state.playlistId, order[0])
  } else {
    // Playlist finished with repeat off: rewind to the first song and stop.
    load(state.playlistId, order[0], { autoplay: false })
  }
}

function prev() {
  if (audio.currentTime > RESTART_THRESHOLD) return seek(0)
  const order = currentOrder()
  if (!order.length) return
  const position = order.indexOf(state.index)

  if (position > 0) load(state.playlistId, order[position - 1])
  else if (state.repeat === 'all') load(state.playlistId, order[order.length - 1])
  else seek(0)
}

function seek(time) {
  const duration = Number.isFinite(audio.duration) ? audio.duration : state.duration
  if (!duration) return
  const target = clamp(time, 0, duration)
  if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) audio.currentTime = target
  else pendingSeek = target
  setState({ currentTime: target })
  updatePositionState()
}

const seekBy = (seconds) => seek((audio.currentTime || 0) + seconds)

function setVolume(value) {
  const volume = clamp(value, 0, 1)
  audio.volume = volume
  if (volume > 0) {
    lastVolume = volume
    audio.muted = false
  }
}

function toggleMute() {
  if (audio.muted || audio.volume === 0) {
    audio.muted = false
    if (audio.volume === 0) audio.volume = lastVolume || 0.5
  } else {
    audio.muted = true
  }
}

function toggleShuffle() {
  const shuffle = !state.shuffle
  setState({ shuffle, order: makeOrder(tracksOf(state.playlistId).length, state.index, shuffle) })
  persist()
}

function cycleRepeat() {
  const repeat = REPEAT_MODES[(REPEAT_MODES.indexOf(state.repeat) + 1) % REPEAT_MODES.length]
  setState({ repeat })
  persist()
}

/* ------------------------------------------------------------------ */
/* Audio element events -> store                                      */
/* ------------------------------------------------------------------ */

audio.addEventListener('play', () => {
  setState({ isPlaying: true })
  if (mediaSession) mediaSession.playbackState = 'playing'
})
audio.addEventListener('pause', () => {
  setState({ isPlaying: false, isBuffering: false })
  if (mediaSession) mediaSession.playbackState = 'paused'
  persist()
})
audio.addEventListener('waiting', () => setState({ isBuffering: true }))
audio.addEventListener('playing', () => setState({ isBuffering: false }))
audio.addEventListener('canplay', () => setState({ isBuffering: false }))

audio.addEventListener('timeupdate', () => {
  setState({ currentTime: audio.currentTime })
  const now = Date.now()
  if (now - lastPersist > 5000) {
    lastPersist = now
    persist()
  }
})

audio.addEventListener('loadedmetadata', () => {
  if (pendingSeek != null) {
    audio.currentTime = Math.min(pendingSeek, audio.duration || pendingSeek)
    pendingSeek = null
  }
  setState({ duration: audio.duration, currentTime: audio.currentTime })
  updatePositionState()
})
audio.addEventListener('durationchange', () => {
  if (Number.isFinite(audio.duration)) setState({ duration: audio.duration })
})
audio.addEventListener('seeked', updatePositionState)

audio.addEventListener('ended', () => {
  if (state.repeat === 'one') {
    audio.currentTime = 0
    play()
  } else {
    next({ auto: true })
  }
})

audio.addEventListener('volumechange', () => {
  setState({ volume: audio.volume, muted: audio.muted })
  persist()
})

audio.addEventListener('error', () => {
  if (!audio.error) return
  setState({ isPlaying: false, isBuffering: false })
  const { track } = getCurrent()
  toast(track ? `Couldn't load "${track.title}"` : "Couldn't load this song")
})

/* ------------------------------------------------------------------ */
/* Startup                                                            */
/* ------------------------------------------------------------------ */

function init() {
  const saved = readSaved()

  if (saved) {
    if (typeof saved.volume === 'number') audio.volume = clamp(saved.volume, 0, 1)
    audio.muted = Boolean(saved.muted)
    if (audio.volume > 0) lastVolume = audio.volume
    setState({
      volume: audio.volume,
      muted: audio.muted,
      shuffle: Boolean(saved.shuffle),
      repeat: REPEAT_MODES.includes(saved.repeat) ? saved.repeat : 'off',
    })
  }

  // Resume where the visitor left off, otherwise load the default playlist (paused),
  // just like the original page did with songs/ncs.
  let playlist = saved ? getPlaylist(saved.playlistId) : null
  let index = playlist ? playlist.tracks.findIndex((t) => t.id === saved.trackId) : -1
  let startAt = saved?.time ?? 0
  if (index < 0) {
    playlist = getDefaultPlaylist()
    index = 0
    startAt = 0
  }
  if (playlist) load(playlist.id, index, { autoplay: false, startAt, resetOrder: true })

  if (mediaSession) {
    const handlers = {
      play: () => play(),
      pause: () => pause(),
      stop: () => {
        pause()
        seek(0)
      },
      previoustrack: () => prev(),
      nexttrack: () => next(),
      seekbackward: (e) => seekBy(-(e.seekOffset || 10)),
      seekforward: (e) => seekBy(e.seekOffset || 10),
      seekto: (e) => seek(e.seekTime),
    }
    for (const [action, handler] of Object.entries(handlers)) {
      try {
        mediaSession.setActionHandler(action, handler)
      } catch {
        // Action not supported by this browser.
      }
    }
  }

  window.addEventListener('pagehide', persist)
}

init()

// Vite hot reload: stop the old audio element instead of playing two songs at once.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
  })
}

export const player = {
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getState: () => state,
  play,
  pause,
  togglePlay,
  playPlaylist,
  togglePlaylist,
  playTrack,
  next,
  prev,
  seek,
  seekBy,
  setVolume,
  toggleMute,
  toggleShuffle,
  cycleRepeat,
}
