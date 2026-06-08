export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      {/* K-branch mark */}
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="34" height="34" rx="8" fill="#185FA5" />
        {/* Horizontal stem */}
        <line x1="8" y1="17" x2="18" y2="17" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        {/* Upper diagonal (white) */}
        <line x1="17" y1="17" x2="26" y2="9" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        {/* Lower diagonal (teal) */}
        <line x1="17" y1="17" x2="26" y2="25" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      {/* Wordmark */}
      <span className="text-[17px] leading-none tracking-tight">
        <span className="font-medium text-white">Kaupeka</span>
        <span style={{ color: '#1D9E75' }}>.</span>
        <span className="font-normal" style={{ color: 'rgba(255,255,255,0.45)' }}>Tech</span>
      </span>
    </div>
  )
}
