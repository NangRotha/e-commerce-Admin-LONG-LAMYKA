import React from "react";

/**
 * 3D Claymorphic SVG Icons
 * Crafted with gradients, inner bevel highlights, and soft clay drop shadows.
 */

// 1. Purple 3D Checkmark Box (Tasks Done)
export function CheckmarkBox3D({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <defs>
        <radialGradient id="chkBg" cx="30%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#bf9cfb" />
          <stop offset="60%" stopColor="#9a71ee" />
          <stop offset="100%" stopColor="#7a47db" />
        </radialGradient>
        <filter id="clayShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#7a47db" floodOpacity="0.3" />
        </filter>
        <linearGradient id="chkLine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ede5ff" />
        </linearGradient>
      </defs>
      {/* Base clay pill */}
      <rect
        x="6"
        y="6"
        width="52"
        height="52"
        rx="18"
        fill="url(#chkBg)"
        filter="url(#clayShadow)"
      />
      {/* Top bevel highlight */}
      <path
        d="M14 8C9.58 8 6 11.58 6 16v4c0-4.42 3.58-8 8-8h36c4.42 0 8 3.58 8 8v-4c0-4.42-3.58-8-8-8H14z"
        fill="#ffffff"
        fillOpacity="0.45"
      />
      {/* Inner bottom shadow */}
      <path
        d="M6 46v2c0 4.42 3.58 8 8 8h36c4.42 0 8-3.58 8-8v-2c0 4.42-3.58 8-8 8H14c-4.42 0-8-3.58-8-8z"
        fill="#4c2299"
        fillOpacity="0.3"
      />
      {/* 3D Checkmark */}
      <path
        d="M20 33l8 8 16-17"
        stroke="url(#chkLine)"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 2. Pink 3D Calendar (In Progress)
export function Calendar3D({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <defs>
        <radialGradient id="calBg" cx="30%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#ffaab6" />
          <stop offset="55%" stopColor="#ff7b8f" />
          <stop offset="100%" stopColor="#e84e68" />
        </radialGradient>
        <filter id="calShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#e84e68" floodOpacity="0.32" />
        </filter>
      </defs>
      {/* Body */}
      <rect
        x="6"
        y="12"
        width="52"
        height="46"
        rx="16"
        fill="url(#calBg)"
        filter="url(#calShadow)"
      />
      {/* Top highlight */}
      <path
        d="M14 13c-4.42 0-8 3.58-8 8v2c0-4.42 3.58-8 8-8h36c4.42 0 8 3.58 8 8v-2c0-4.42-3.58-8-8-8H14z"
        fill="#ffffff"
        fillOpacity="0.45"
      />
      {/* Rings */}
      <rect x="18" y="6" width="6" height="12" rx="3" fill="#ffffff" />
      <rect x="40" y="6" width="6" height="12" rx="3" fill="#ffffff" />
      {/* Header bar divider */}
      <line x1="12" y1="26" x2="52" y2="26" stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.6" strokeLinecap="round" />
      {/* Mini dots grid */}
      <circle cx="22" cy="35" r="3" fill="#ffffff" />
      <circle cx="32" cy="35" r="3" fill="#ffffff" />
      <circle cx="42" cy="35" r="3" fill="#ffffff" />
      <circle cx="22" cy="45" r="3" fill="#ffffff" />
      <circle cx="32" cy="45" r="3" fill="#ffffff" fillOpacity="0.5" />
      <circle cx="42" cy="45" r="3" fill="#ffffff" fillOpacity="0.5" />
    </svg>
  );
}

// 3. Mint Green 3D Flag (Completed)
export function Flag3D({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <defs>
        <radialGradient id="flagBg" cx="30%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#9aebba" />
          <stop offset="60%" stopColor="#5ecb8b" />
          <stop offset="100%" stopColor="#37a766" />
        </radialGradient>
        <filter id="flagShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#37a766" floodOpacity="0.3" />
        </filter>
      </defs>
      {/* Background container */}
      <rect
        x="6"
        y="6"
        width="52"
        height="52"
        rx="18"
        fill="url(#flagBg)"
        filter="url(#flagShadow)"
      />
      {/* Highlight */}
      <path
        d="M14 8C9.58 8 6 11.58 6 16v3c0-4.42 3.58-8 8-8h36c4.42 0 8 3.58 8 8v-3c0-4.42-3.58-8-8-8H14z"
        fill="#ffffff"
        fillOpacity="0.45"
      />
      {/* 3D Flag Pole */}
      <rect x="20" y="15" width="4.5" height="34" rx="2.25" fill="#ffffff" />
      {/* Flag Shape */}
      <path
        d="M24 18c6-2 10 2 16 0 4-1.33 6-0.5 8 0v16c-2-0.5-4-1.33-8 0-6 2-10-2-16 0V18z"
        fill="#ffffff"
        fillOpacity="0.95"
      />
    </svg>
  );
}

// 4. Gold 3D Puffy Star (Focus Time / Revenue)
export function Star3D({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <defs>
        <radialGradient id="starBg" cx="30%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#ffe699" />
          <stop offset="55%" stopColor="#ffc94d" />
          <stop offset="100%" stopColor="#f5a623" />
        </radialGradient>
        <filter id="starShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#f5a623" floodOpacity="0.35" />
        </filter>
      </defs>
      {/* Container */}
      <rect
        x="6"
        y="6"
        width="52"
        height="52"
        rx="18"
        fill="url(#starBg)"
        filter="url(#starShadow)"
      />
      {/* Highlight */}
      <path
        d="M14 8C9.58 8 6 11.58 6 16v3c0-4.42 3.58-8 8-8h36c4.42 0 8 3.58 8 8v-3c0-4.42-3.58-8-8-8H14z"
        fill="#ffffff"
        fillOpacity="0.5"
      />
      {/* 3D Star shape */}
      <path
        d="M32 17l4.3 8.7 9.6 1.4-7 6.8 1.6 9.6L32 39l-8.5 4.5 1.6-9.6-7-6.8 9.6-1.4L32 17z"
        fill="#ffffff"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 5. 3D Home (Dashboard)
export function Home3D({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 10.5L12 3l9 7.5v9.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9.5z"
        fill="currentColor"
        fillOpacity="0.25"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 22V12h6v10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 6. Yellow 3D Folder (Projects / Recent Activity)
export function Folder3D({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <radialGradient id="folBg" cx="30%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#ffd875" />
          <stop offset="60%" stopColor="#f7ba2a" />
          <stop offset="100%" stopColor="#df9c14" />
        </radialGradient>
      </defs>
      <rect x="3" y="5" width="11" height="6" rx="2" fill="#df9c14" />
      <rect x="3" y="8" width="26" height="19" rx="4" fill="url(#folBg)" />
      <path d="M5 10c0-1.1.9-2 2-2h18c1.1 0 2 .9 2 2v2H5v-2z" fill="#ffffff" fillOpacity="0.4" />
    </svg>
  );
}

// 7. Green 3D Check Circle (Recent Activity)
export function CheckCircle3D({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <radialGradient id="chkCirBg" cx="30%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#8eecb5" />
          <stop offset="65%" stopColor="#4bc47d" />
          <stop offset="100%" stopColor="#2b9956" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="13" fill="url(#chkCirBg)" />
      <path d="M7 13a9 9 0 0 1 18 0" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
      <path d="M11 16l3.5 3.5 7-7" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// 8. Pink 3D Chat Bubble (Recent Activity)
export function ChatBubble3D({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <radialGradient id="chatBg" cx="30%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#ffaab8" />
          <stop offset="60%" stopColor="#ff748b" />
          <stop offset="100%" stopColor="#e54864" />
        </radialGradient>
      </defs>
      <path
        d="M6 14.5C6 9.8 10.5 6 16 6s10 3.8 10 8.5c0 4.7-4.5 8.5-10 8.5-1.5 0-3-.3-4.3-.8L7 24l.8-4.5C6.9 18 6 16.3 6 14.5z"
        fill="url(#chatBg)"
      />
      <circle cx="12" cy="14" r="1.5" fill="#ffffff" />
      <circle cx="16" cy="14" r="1.5" fill="#ffffff" />
      <circle cx="20" cy="14" r="1.5" fill="#ffffff" />
    </svg>
  );
}

// 9. Blue 3D Cloud Upload (Recent Activity)
export function CloudUpload3D({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <radialGradient id="cldBg" cx="30%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#9ed3ff" />
          <stop offset="60%" stopColor="#64b0f8" />
          <stop offset="100%" stopColor="#3d8ee0" />
        </radialGradient>
      </defs>
      <path
        d="M23 19a5 5 0 0 0-1-9.9 7 7 0 0 0-13 3 5 5 0 0 0 1 9.9h13z"
        fill="url(#cldBg)"
      />
      <path d="M16 22v-8m-3 3l3-3 3 3" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
