// Side-3/4 sports car silhouette in a line-art wireframe style.
// Replace with a real 3D render when available.
export function CarRender({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 720 360"
      className={className}
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a5d7a" stopOpacity="0.35" />
          <stop offset="1" stopColor="#0b1622" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="carFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#23415a" stopOpacity="0.5" />
          <stop offset="1" stopColor="#0b1622" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="floorGlow" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor="#5b7f9d" stopOpacity="0.18" />
          <stop offset="1" stopColor="#0b1622" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* floor reflection */}
      <ellipse cx="360" cy="320" rx="320" ry="24" fill="url(#floorGlow)" />

      {/* body silhouette — roof arc and hood */}
      <path
        d="M80 250 C 120 220, 170 195, 230 185 C 280 160, 330 142, 400 140 C 460 138, 510 150, 560 180 C 600 200, 630 225, 660 250 Z"
        fill="url(#carBody)"
        stroke="#8da1b5"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      {/* windshield + greenhouse */}
      <path
        d="M238 186 L 300 148 L 436 144 L 506 184"
        stroke="#b5c4d3"
        strokeOpacity="0.7"
        strokeWidth="1"
        fill="none"
      />
      {/* side line */}
      <path
        d="M100 240 L 280 218 L 460 214 L 620 238"
        stroke="#5b7f9d"
        strokeOpacity="0.55"
        strokeWidth="0.8"
      />
      {/* door cuts */}
      <path d="M300 218 L 304 252" stroke="#5b7f9d" strokeOpacity="0.4" strokeWidth="0.6" />
      <path d="M400 216 L 404 252" stroke="#5b7f9d" strokeOpacity="0.4" strokeWidth="0.6" />
      <path d="M500 220 L 502 252" stroke="#5b7f9d" strokeOpacity="0.4" strokeWidth="0.6" />

      {/* wheels */}
      <g transform="translate(180 260)">
        <circle r="36" fill="#070d14" stroke="#8da1b5" strokeWidth="1.25" />
        <circle r="18" fill="none" stroke="#5b7f9d" strokeWidth="0.8" />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <line
            key={deg}
            x1="0"
            y1="0"
            x2="16"
            y2="0"
            stroke="#5b7f9d"
            strokeWidth="1"
            transform={`rotate(${deg})`}
          />
        ))}
      </g>
      <g transform="translate(540 260)">
        <circle r="40" fill="#070d14" stroke="#8da1b5" strokeWidth="1.25" />
        <circle r="20" fill="none" stroke="#5b7f9d" strokeWidth="0.8" />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <line
            key={deg}
            x1="0"
            y1="0"
            x2="18"
            y2="0"
            stroke="#5b7f9d"
            strokeWidth="1"
            transform={`rotate(${deg})`}
          />
        ))}
      </g>

      {/* headlight + taillight glints */}
      <circle cx="638" cy="230" r="3" fill="#b5c4d3" opacity="0.9" />
      <circle cx="90" cy="234" r="2" fill="#C96442" opacity="0.75" />

      {/* reflection flipped below floor */}
      <g opacity="0.18">
        <path
          d="M80 250 C 120 270, 170 290, 230 298 C 280 316, 330 328, 400 330 C 460 330, 510 320, 560 302 C 600 288, 630 274, 660 250 Z"
          fill="url(#carFloor)"
        />
      </g>
    </svg>
  );
}
