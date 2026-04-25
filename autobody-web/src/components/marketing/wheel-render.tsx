// Chrome-style alloy wheel placeholder. Replace with a real 3D render when available.
export function WheelRender({ className }: { className?: string }) {
  const spokes = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];
  return (
    <svg viewBox="0 0 480 480" className={className} fill="none" aria-hidden>
      <defs>
        <radialGradient id="wheelOuter" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#2a4660" />
          <stop offset="0.7" stopColor="#152938" />
          <stop offset="1" stopColor="#070d14" />
        </radialGradient>
        <radialGradient id="wheelFace" cx="0.5" cy="0.45" r="0.55">
          <stop offset="0" stopColor="#b5c4d3" />
          <stop offset="0.45" stopColor="#6b8094" />
          <stop offset="0.75" stopColor="#23415a" />
          <stop offset="1" stopColor="#0b1622" />
        </radialGradient>
        <radialGradient id="wheelHub" cx="0.5" cy="0.4" r="0.5">
          <stop offset="0" stopColor="#dde6ef" />
          <stop offset="0.6" stopColor="#6b8094" />
          <stop offset="1" stopColor="#152938" />
        </radialGradient>
        <linearGradient id="wheelSheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
        <radialGradient id="floorHalo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#3a5d7a" stopOpacity="0.25" />
          <stop offset="1" stopColor="#070d14" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* floor halo */}
      <ellipse cx="240" cy="430" rx="200" ry="18" fill="url(#floorHalo)" />

      {/* outer tire */}
      <circle cx="240" cy="240" r="220" fill="url(#wheelOuter)" />
      <circle cx="240" cy="240" r="220" fill="url(#wheelSheen)" />
      <circle cx="240" cy="240" r="218" stroke="#3a5d7a" strokeOpacity="0.5" strokeWidth="1" />

      {/* tire tread detail */}
      {[...Array(48)].map((_, i) => {
        const a = (i * 360) / 48;
        return (
          <line
            key={i}
            x1="240"
            y1="30"
            x2="240"
            y2="46"
            stroke="#0b1622"
            strokeWidth="1.5"
            transform={`rotate(${a} 240 240)`}
          />
        );
      })}

      {/* inner rim bevel */}
      <circle cx="240" cy="240" r="188" stroke="#5b7f9d" strokeOpacity="0.35" strokeWidth="1" />
      <circle cx="240" cy="240" r="180" fill="#0b1622" />

      {/* wheel face */}
      <circle cx="240" cy="240" r="172" fill="url(#wheelFace)" />
      <circle cx="240" cy="240" r="172" fill="url(#wheelSheen)" />
      <circle cx="240" cy="240" r="170" stroke="#dde6ef" strokeOpacity="0.25" strokeWidth="0.75" />

      {/* spokes */}
      <g transform="translate(240 240)">
        {spokes.map((deg) => (
          <g key={deg} transform={`rotate(${deg})`}>
            <path
              d="M0 -36 L 14 -152 L -14 -152 Z"
              fill="#b5c4d3"
              fillOpacity="0.85"
              stroke="#0b1622"
              strokeWidth="1"
            />
            <path
              d="M0 -38 L 6 -148"
              stroke="#ffffff"
              strokeOpacity="0.35"
              strokeWidth="1"
            />
          </g>
        ))}
      </g>

      {/* lug holes */}
      <g transform="translate(240 240)">
        {[0, 72, 144, 216, 288].map((deg) => (
          <g key={deg} transform={`rotate(${deg}) translate(0 -90)`}>
            <circle r="7" fill="#070d14" stroke="#8da1b5" strokeWidth="0.75" />
            <circle r="3" fill="#3a5d7a" />
          </g>
        ))}
      </g>

      {/* hub cap */}
      <circle cx="240" cy="240" r="44" fill="url(#wheelHub)" />
      <circle cx="240" cy="240" r="44" stroke="#dde6ef" strokeOpacity="0.35" strokeWidth="1" />
      <circle cx="240" cy="240" r="16" fill="#070d14" stroke="#8da1b5" strokeWidth="0.75" />

      {/* highlight arc */}
      <path
        d="M120 140 A 160 160 0 0 1 360 140"
        stroke="#ffffff"
        strokeOpacity="0.25"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}
