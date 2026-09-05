/**
 * Neutral stand-in used until a photograph is installed in
 * src/assets/doctor/. Intentionally an unlit silhouette rather than an
 * illustrated character: it reads as "image pending", not as a mascot, and it
 * carries the same layer structure so the rig can be judged without the photo.
 */
export function DoctorPlaceholder({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 760"
      className={className}
      aria-hidden
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <linearGradient id="mf-coat" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="52%" stopColor="#f2efe8" />
          <stop offset="100%" stopColor="#dbd7cc" />
        </linearGradient>
        <linearGradient id="mf-skin" x1="0.2" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#4d4d44" />
          <stop offset="100%" stopColor="#31312a" />
        </linearGradient>
      </defs>

      {/* torso + shoulders: a coat silhouette, wider than it is tall */}
      <path
        d="M62 760c0-176 26-262 104-292l50-19 44 22 44-22 50 19c78 30 104 116 104 292z"
        fill="url(#mf-coat)"
      />
      {/* centre seam and lapels */}
      <path d="M260 471l-40 289h24l30-241 30 241h24l-40-289z" fill="#e6e2d7" />
      <path d="M216 449l44 42 44-42-18-17-26 24-26-24z" fill="#ece9e0" />

      {/* stethoscope */}
      <path
        d="M231 470c-16 50-8 100 22 128M289 470c16 50 8 100-22 128"
        stroke="#4f6152"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="267" cy="604" r="15" fill="#4f6152" />
      <circle cx="267" cy="604" r="7" fill="#3b4a3e" />

      {/* neck */}
      <path d="M235 392h50v70l-25 24-25-24z" fill="url(#mf-skin)" />
      {/* jaw shadow */}
      <path d="M235 392h50v22a25 25 0 0 1-50 0z" fill="#2a2a24" opacity="0.5" />

      {/* head — deliberately modest against the shoulders */}
      <ellipse cx="260" cy="330" rx="66" ry="80" fill="url(#mf-skin)" />
      {/* ears */}
      <ellipse cx="195" cy="336" rx="10" ry="17" fill="#3d3d35" />
      <ellipse cx="325" cy="336" rx="10" ry="17" fill="#3d3d35" />
      {/* hair */}
      <path
        d="M194 324c0-50 30-82 66-82s66 32 66 82c0-27-24-38-66-38s-66 11-66 38z"
        fill="#26261f"
      />
    </svg>
  );
}
