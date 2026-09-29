/** Animated bars shown next to the song that is playing. */
export default function Equalizer({ className = '' }) {
  return (
    <span className={`eq ${className}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  )
}
