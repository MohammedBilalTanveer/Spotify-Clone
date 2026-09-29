// Builds src/data/library.json from the folders in public/songs.
//
// The original project discovered songs by fetching Live Server's directory
// listing, which doesn't exist on Vercel (or any static host). Instead, this
// script scans the folders at build time and writes a manifest the app imports.
//
// Folder layout (one folder = one playlist):
//   public/songs/<playlist>/info.json   { "title", "description", "artist"?, "tracks"? }
//   public/songs/<playlist>/cover.jpg   (or .jpeg / .png / .webp)
//   public/songs/<playlist>/*.mp3       (also .m4a .aac .ogg .opus .wav .flac)
//
// Runs automatically on `npm run dev` / `npm run build` (see vite.config.js),
// or manually with `npm run library`.

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const SONGS_DIR = path.join(ROOT, 'public', 'songs')
const OUT_FILE = path.join(ROOT, 'src', 'data', 'library.json')

const AUDIO_EXT = new Set(['.mp3', '.m4a', '.aac', '.ogg', '.oga', '.opus', '.wav', '.flac'])
const COVER_NAMES = ['cover.jpg', 'cover.jpeg', 'cover.png', 'cover.webp']
const DEFAULT_ARTIST = 'Bilal'

const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })
const toUrl = (...segments) => '/' + ['songs', ...segments].map(encodeURIComponent).join('/')

let parseFile = null
try {
  ;({ parseFile } = await import('music-metadata'))
} catch {
  // Durations are optional - the player reads them from the audio at runtime.
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch (err) {
    if (err.code !== 'ENOENT') console.warn(`[library] Could not read ${file}: ${err.message}`)
    return {}
  }
}

async function getDuration(file) {
  if (!parseFile) return null
  try {
    const meta = await parseFile(file, { duration: true, skipCovers: true })
    return meta.format.duration ? Math.round(meta.format.duration * 10) / 10 : null
  } catch {
    return null
  }
}

// "Artist - Title.mp3" -> { artist, title }; anything else -> title only.
function parseName(fileName, fallbackArtist) {
  const base = fileName.slice(0, fileName.length - path.extname(fileName).length).trim()
  const match = base.match(/^(.+?)\s+-\s+(.+)$/)
  if (match) return { artist: match[1].trim(), title: match[2].trim() }
  return { artist: fallbackArtist, title: base }
}

async function buildPlaylist(folder) {
  const dir = path.join(SONGS_DIR, folder)
  const files = await readdir(dir)
  const info = await readJson(path.join(dir, 'info.json'))
  const overrides = info.tracks ?? {}
  const artist = info.artist || DEFAULT_ARTIST

  const coverFile = COVER_NAMES.find((name) => files.some((f) => f.toLowerCase() === name))
  const audioFiles = files
    .filter((f) => AUDIO_EXT.has(path.extname(f).toLowerCase()))
    .sort(collator.compare)

  const tracks = await Promise.all(
    audioFiles.map(async (file) => ({
      id: `${folder}/${file}`,
      ...parseName(file, artist),
      ...overrides[file],
      src: toUrl(folder, file),
      duration: await getDuration(path.join(dir, file)),
    })),
  )

  return {
    id: folder,
    title: info.title || folder,
    description: info.description || '',
    owner: artist,
    cover: coverFile ? toUrl(folder, files.find((f) => f.toLowerCase() === coverFile)) : null,
    tracks,
  }
}

export async function generateLibrary({ quiet = false } = {}) {
  let folders = []
  try {
    const entries = await readdir(SONGS_DIR, { withFileTypes: true })
    folders = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort(collator.compare)
  } catch {
    console.warn(`[library] ${SONGS_DIR} not found - generating an empty library.`)
  }

  const playlists = await Promise.all(folders.map(buildPlaylist))
  const json = JSON.stringify({ playlists }, null, 2) + '\n'

  await mkdir(path.dirname(OUT_FILE), { recursive: true })
  const previous = await readFile(OUT_FILE, 'utf8').catch(() => '')
  if (previous !== json) await writeFile(OUT_FILE, json)

  if (!quiet) {
    const songCount = playlists.reduce((n, p) => n + p.tracks.length, 0)
    console.log(`[library] ${playlists.length} playlists, ${songCount} songs -> src/data/library.json`)
  }
  return playlists
}

// Run directly: `node scripts/generate-library.mjs`
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  await generateLibrary()
}
