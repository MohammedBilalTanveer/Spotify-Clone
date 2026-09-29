import { defineConfig, normalizePath } from 'vite'
import react from '@vitejs/plugin-react'
import { generateLibrary, SONGS_DIR } from './scripts/generate-library.mjs'

// Regenerates src/data/library.json from public/songs before every dev/build run,
// and again whenever you add, remove or rename files in public/songs while `npm run dev` is running.
function songLibrary() {
  const songsDir = normalizePath(SONGS_DIR)
  let timer
  return {
    name: 'song-library',
    async buildStart() {
      await generateLibrary()
    },
    configureServer(server) {
      server.watcher.add(SONGS_DIR)
      const regenerate = (file) => {
        if (!normalizePath(file).startsWith(songsDir)) return
        clearTimeout(timer)
        timer = setTimeout(() => {
          generateLibrary().catch((err) => server.config.logger.error(`[library] ${err.message}`))
        }, 300)
      }
      for (const event of ['add', 'unlink', 'change', 'addDir', 'unlinkDir']) {
        server.watcher.on(event, regenerate)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), songLibrary()],
})
