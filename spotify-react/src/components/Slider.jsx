import { useRef, useState } from 'react'

const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

/**
 * Accessible range slider used for the seek bar and volume.
 * Works with mouse, touch and pen (pointer events) and the keyboard.
 *
 * onChange(value) - fires continuously while dragging
 * onCommit(value) - fires when the drag ends, or on a keyboard step
 */
export default function Slider({
  value,
  max,
  step = 1,
  label,
  valueText,
  disabled = false,
  onChange,
  onCommit,
  className = '',
}) {
  const ref = useRef(null)
  const dragging = useRef(false)
  const [dragValue, setDragValue] = useState(null)

  const shown = dragValue ?? value
  const percent = max > 0 ? clamp(shown / max, 0, 1) * 100 : 0

  const valueAt = (clientX) => {
    const rect = ref.current.getBoundingClientRect()
    return clamp((clientX - rect.left) / rect.width, 0, 1) * max
  }

  const update = (e) => {
    const next = valueAt(e.clientX)
    setDragValue(next)
    onChange?.(next)
  }

  const handlePointerDown = (e) => {
    if (disabled || !max || (e.pointerType === 'mouse' && e.button !== 0)) return
    dragging.current = true
    ref.current.setPointerCapture?.(e.pointerId)
    update(e)
  }

  const handlePointerMove = (e) => {
    if (dragging.current) update(e)
  }

  const handlePointerEnd = (e) => {
    if (!dragging.current) return
    dragging.current = false
    const final = valueAt(e.clientX)
    setDragValue(null)
    onCommit?.(final)
  }

  const handleKeyDown = (e) => {
    if (disabled || !max) return
    const big = max / 10
    const steps = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: big, PageDown: -big }
    let next
    if (e.key in steps) next = value + steps[e.key]
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = max
    else return
    e.preventDefault()
    onCommit?.(clamp(next, 0, max))
  }

  return (
    <div
      ref={ref}
      className={`slider${dragValue !== null ? ' is-dragging' : ''} ${className}`}
      style={{ '--percent': `${percent}%` }}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.round(max * 100) / 100}
      aria-valuenow={Math.round(shown * 100) / 100}
      aria-valuetext={valueText}
      aria-disabled={disabled || undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
    >
      <div className="slider__track">
        <div className="slider__fill" />
      </div>
      <div className="slider__thumb" />
    </div>
  )
}
