export default function Spinner({ size = 20 }) {
  return (
    <svg className="spin" viewBox="0 0 24 24" fill="none" width={size} height={size}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="28 56" strokeLinecap="round"/>
    </svg>
  )
}