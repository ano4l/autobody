// Top-down line-art car silhouette in a technical-drawing style.
export function CarTopdown({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 640"
      className={className}
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="topBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0f1d2c" stopOpacity="0.2" />
          <stop offset="0.5" stopColor="#1c3445" stopOpacity="0.45" />
          <stop offset="1" stopColor="#0f1d2c" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* floor glow */}
      <rect x="40" y="40" width="240" height="560" rx="120" fill="url(#topBody)" />

      {/* outer body outline */}
      <path
        d="M160 30
           C 100 34, 70 70, 64 120
           C 58 170, 56 240, 58 320
           C 60 420, 66 500, 72 560
           C 80 600, 120 616, 160 618
           C 200 616, 240 600, 248 560
           C 254 500, 260 420, 262 320
           C 264 240, 262 170, 256 120
           C 250 70, 220 34, 160 30 Z"
        stroke="#8da1b5"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />

      {/* windshield */}
      <path
        d="M92 140 C 110 158, 140 166, 160 166 C 180 166, 210 158, 228 140"
        stroke="#b5c4d3"
        strokeOpacity="0.6"
        strokeWidth="1"
      />
      {/* rear window */}
      <path
        d="M92 480 C 110 462, 140 456, 160 456 C 180 456, 210 462, 228 480"
        stroke="#b5c4d3"
        strokeOpacity="0.6"
        strokeWidth="1"
      />

      {/* roof panel */}
      <path
        d="M100 180 L 220 180 L 220 450 L 100 450 Z"
        stroke="#5b7f9d"
        strokeOpacity="0.4"
        strokeWidth="0.8"
      />

      {/* center spine */}
      <line x1="160" y1="180" x2="160" y2="450" stroke="#5b7f9d" strokeOpacity="0.25" strokeWidth="0.6" />

      {/* door cuts */}
      <line x1="100" y1="260" x2="220" y2="260" stroke="#5b7f9d" strokeOpacity="0.3" strokeWidth="0.6" />
      <line x1="100" y1="370" x2="220" y2="370" stroke="#5b7f9d" strokeOpacity="0.3" strokeWidth="0.6" />

      {/* front wheels */}
      <rect x="52" y="150" width="12" height="44" rx="3" fill="#070d14" stroke="#8da1b5" strokeWidth="1" />
      <rect x="256" y="150" width="12" height="44" rx="3" fill="#070d14" stroke="#8da1b5" strokeWidth="1" />
      {/* rear wheels */}
      <rect x="52" y="440" width="12" height="48" rx="3" fill="#070d14" stroke="#8da1b5" strokeWidth="1" />
      <rect x="256" y="440" width="12" height="48" rx="3" fill="#070d14" stroke="#8da1b5" strokeWidth="1" />

      {/* headlights */}
      <path d="M104 54 L 140 46" stroke="#b5c4d3" strokeOpacity="0.7" strokeWidth="1.2" />
      <path d="M216 54 L 180 46" stroke="#b5c4d3" strokeOpacity="0.7" strokeWidth="1.2" />
      {/* taillights */}
      <path d="M108 588 L 146 594" stroke="#C96442" strokeOpacity="0.7" strokeWidth="1.2" />
      <path d="M212 588 L 174 594" stroke="#C96442" strokeOpacity="0.7" strokeWidth="1.2" />

      {/* side mirrors */}
      <circle cx="68" cy="148" r="3" fill="#5b7f9d" opacity="0.8" />
      <circle cx="252" cy="148" r="3" fill="#5b7f9d" opacity="0.8" />
    </svg>
  );
}
