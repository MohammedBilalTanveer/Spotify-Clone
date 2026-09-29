import { useEffect, useState } from 'react'
import { subscribeToasts } from '../lib/toast'

const DURATION = 3000

export default function Toaster() {
  const [toasts, setToasts] = useState([])

  useEffect(
    () =>
      subscribeToasts((item) => {
        // Replace an identical message instead of stacking duplicates; keep at most 3.
        setToasts((list) => [...list.filter((t) => t.message !== item.message), item].slice(-3))
        setTimeout(() => setToasts((list) => list.filter((t) => t.id !== item.id)), DURATION)
      }),
    [],
  )

  return (
    <div className="toaster" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          {t.message}
        </div>
      ))}
    </div>
  )
}
