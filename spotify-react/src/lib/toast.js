// Tiny pub/sub so any module (including the non-React player) can show a toast.
const listeners = new Set()
let nextId = 1

export function toast(message) {
  const item = { id: nextId++, message }
  listeners.forEach((listener) => listener(item))
}

export function subscribeToasts(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
