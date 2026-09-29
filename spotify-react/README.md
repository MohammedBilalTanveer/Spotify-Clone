# Spotify Clone (React)

A Spotify-style web music player built with **React 19 + Vite + React Router**.
Pure frontend: no backend, no database, so it deploys to Vercel as a static site.

## Features

- **Home**: greeting, quick-pick tiles, and the "Spotify Playlists" card grid (hover a card to reveal the green play button)
- **Playlist pages** (`/playlist/:id`): cover, title, description, song count and total length, a big play button, shuffle, and the song list. The header color comes from the cover image
- **Search** (`/search?q=`): live search across songs and playlists, plus "Browse all" tiles
- **Your Library** sidebar: every playlist, plus the songs of the loaded playlist with "Play Now" buttons, as in the original design
- **Player**: play/pause, previous/next, shuffle, repeat (off/all/one), a draggable seek bar, and volume with mute. When a song ends, the next one starts
- **Remembers** the last song, position, volume, shuffle and repeat (saved in `localStorage`)
- **Lock-screen and headphone controls** through the Media Session API
- **Keyboard shortcuts**: `Space` play/pause · `←/→` seek 5s · `Shift+←/→` previous/next · `M` mute · `S` shuffle · `R` repeat · `/` search
- **Responsive**
  - Desktop (≥1024px): sidebar, content, and the full player bar
  - Tablet (640–1023px): the sidebar becomes a slide-in drawer (hamburger button), with the full player bar
  - Phone (<640px): a mini player and a bottom tab bar. Tap the mini player for a full-screen player (swipe down to close)
- Accessible: keyboard focus styles, ARIA labels on every control, a skip link, and support for reduced motion

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

```bash
npm run build     # production build -> dist/
npm run preview   # serve the production build locally
```

## Adding songs and playlists

Each folder in `public/songs/` is one playlist:

```
public/songs/
  ncs/
    info.json        <- { "title": "Naat", "description": "Naats for you" }
    cover.jpg        <- cover.jpeg / .png / .webp also work
    Some Song.mp3    <- .mp3 .m4a .aac .ogg .opus .wav .flac
```

Drop the files in and you're done. `scripts/generate-library.mjs` scans the folders and writes
`src/data/library.json`. It runs automatically on `npm run dev` and `npm run build`, and again
whenever you add or remove songs while the dev server is running. You can also run it yourself
with `npm run library`.

- Song titles come from the file names. `Artist - Title.mp3` is split into artist and title
- Songs without an artist show `"artist"` from `info.json`, or `Bilal`
- To rename a song without renaming its file, add a `tracks` entry to `info.json`:

```json
{
  "title": "Naat",
  "description": "Naats for you",
  "tracks": {
    "A Humood - Kunt.mp3": { "artist": "Humood", "title": "Kunt" }
  }
}
```

The playlist that loads on a visitor's first visit is set by `DEFAULT_PLAYLIST_ID` in
`src/data/library.js`.

## Deploy to Vercel

**Option A: GitHub (recommended)**

1. Push this folder to a GitHub repository.
2. On [vercel.com/new](https://vercel.com/new), import the repository. Vercel detects Vite automatically.
   If the app is in a subfolder of the repo, set **Root Directory** to that folder.
3. Click **Deploy**.

**Option B: Vercel CLI**

```bash
npx vercel          # preview deployment
npx vercel --prod   # production deployment
```

`vercel.json` already rewrites every route to `index.html`, so links like `/playlist/ncs` still
work after a page refresh. It also sets cache headers for the build assets and songs.

## Project structure

```
scripts/generate-library.mjs   builds the song manifest from public/songs
src/
  player/player.js             audio engine + store (one shared <audio>, outside React)
  player/usePlayer.js          hooks to read player state in components
  data/library.js              playlist helpers (library.json is generated)
  components/                  Sidebar, Topbar, PlayerBar, MiniPlayer, NowPlaying, TrackList, ...
  pages/                       Home, Playlist, Search, NotFound
  hooks/                       media queries, cover colors, keyboard shortcuts, history arrows
  styles/                      plain CSS, split by area
```

---

A clone made for learning. Not affiliated with Spotify.
