/**
 * High-definition SVG Flags
 * Cross-platform compatible (renders identically on Windows, Mac, iOS, Android)
 */

export function CambodiaFlag({ className = "w-4 h-3" }) {
  return (
    <svg
      viewBox="0 0 640 480"
      className={className}
      aria-hidden="true"
    >
      {/* Blue top and bottom bands */}
      <rect width="640" height="480" fill="#032ea1" />
      {/* Red middle band */}
      <rect y="120" width="640" height="240" fill="#e00025" />
      {/* Angkor Wat silhouette */}
      <g fill="#ffffff">
        {/* Base platform */}
        <path d="M190 320h260v8H190zM200 310h240v8H200zM212 300h216v8H212z" />
        {/* Central tower */}
        <path d="M312 210l8-40 8 40h-16zM306 240l14-26 14 26h-28zM300 270l20-25 20 25h-40zM294 300h52v-26h-52z" />
        {/* Left main tower */}
        <path d="M256 240l6-25 6 25h-12zM250 265l12-20 12 20h-24zM245 285l17-18 17 18h-34zM242 300h40v-14h-40z" />
        {/* Right main tower */}
        <path d="M372 240l6-25 6 25h-12zM366 265l12-20 12 20h-24zM361 285l17-18 17 18h-34zM358 300h40v-14h-40z" />
        {/* Left outer tower */}
        <path d="M222 265l4-15 4 15h-8zM218 285l8-16 8 16h-16zM216 300h20v-13h-20z" />
        {/* Right outer tower */}
        <path d="M410 265l4-15 4 15h-8zM406 285l8-16 8 16h-16zM404 300h20v-13h-20z" />
      </g>
    </svg>
  );
}

export function EnglishFlag({ className = "w-4 h-3" }) {
  return (
    <svg
      viewBox="0 0 640 480"
      className={className}
      aria-hidden="true"
    >
      <clipPath id="uk-clip-admin">
        <rect width="640" height="480" rx="2" />
      </clipPath>
      <g clipPath="url(#uk-clip-admin)">
        {/* Navy background */}
        <rect width="640" height="480" fill="#012169" />
        {/* White saltires */}
        <path d="M0 0l640 480m0-480L0 480" stroke="#ffffff" strokeWidth="60" />
        {/* Red saltires */}
        <path d="M0 0l640 480m0-480L0 480" stroke="#c8102e" strokeWidth="20" />
        {/* White cross */}
        <path d="M320 0v480M0 240h640" stroke="#ffffff" strokeWidth="100" />
        {/* Red cross */}
        <path d="M320 0v480M0 240h640" stroke="#c8102e" strokeWidth="60" />
      </g>
    </svg>
  );
}
