// src/components/ui/DeltaLogo.tsx - Official Delta Parafusos Especiais Logo (Vector SVG)
import React from 'react';

interface DeltaLogoProps {
  className?: string;
  size?: number;
}

export function DeltaLogo({ className = '', size = 48 }: DeltaLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="deltaGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f8fafc" />
        </radialGradient>
      </defs>

      {/* White circle boundary */}
      <circle cx="100" cy="100" r="96" fill="url(#deltaGlow)" stroke="#cbd5e1" strokeWidth="1.5" />

      {/* Center Base Triangle (Delta) */}
      <polygon
        points="65,152 135,152 100,118"
        fill="#991b1b"
      />

      {/* Symmetrical Curved Wings / Hyperbolic Blades */}
      {/* Pair 1 - Center Inner dark blades */}
      <path
        d="M 96,82 C 90,60 70,52 62,56 C 74,68 88,96 82,130 C 88,110 96,94 96,82 Z"
        fill="#581c24"
      />
      <path
        d="M 104,82 C 110,60 130,52 138,56 C 126,68 112,96 118,130 C 112,110 104,94 104,82 Z"
        fill="#581c24"
      />

      {/* Pair 2 - Inner-mid blades */}
      <path
        d="M 86,72 C 78,54 58,52 48,60 C 60,70 76,102 64,142 C 72,120 84,94 86,72 Z"
        fill="#7f1d1d"
      />
      <path
        d="M 114,72 C 122,54 142,52 152,60 C 140,70 124,102 136,142 C 128,120 116,94 114,72 Z"
        fill="#7f1d1d"
      />

      {/* Pair 3 - Outer-mid blades */}
      <path
        d="M 76,68 C 66,54 48,58 38,68 C 50,78 64,112 48,150 C 58,128 72,96 76,68 Z"
        fill="#b91c1c"
      />
      <path
        d="M 124,68 C 134,54 152,58 162,68 C 150,78 136,112 152,150 C 142,128 128,96 124,68 Z"
        fill="#b91c1c"
      />

      {/* Pair 4 - Outermost flared wings */}
      <path
        d="M 66,74 C 54,64 38,72 32,82 C 42,90 54,124 38,154 C 48,134 60,102 66,74 Z"
        fill="#dc2626"
      />
      <path
        d="M 134,74 C 146,64 162,72 168,82 C 158,90 146,124 162,154 C 152,134 140,102 134,74 Z"
        fill="#dc2626"
      />
    </svg>
  );
}
