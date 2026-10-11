export default function Logo({ className = 'h-7 w-auto', ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 150"
      className={className}
      role="img"
      aria-label="Cognara Logo"
      {...props}
    >
      <defs>
        <linearGradient id="loopGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>

      <g transform="translate(5, 0)">
        <path
          d="M 55,105 C 10,105 10,45 55,45 C 85,45 100,65 115,75 C 130,85 145,105 175,105 C 220,105 220,45 175,45 C 145,45 130,65 115,75 C 100,85 85,105 55,105 Z"
          fill="none"
          stroke="url(#loopGradient)"
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="175" cy="45" r="9" fill="#F59E0B" />
        <circle cx="55" cy="105" r="9" fill="#F59E0B" />
      </g>
    </svg>
  )
}
