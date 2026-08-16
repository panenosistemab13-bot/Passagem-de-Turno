// Brand assets and image constants for Café Três Corações

const badgeLogoSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2E1B10"/>
      <stop offset="60%" stop-color="#180F0A"/>
      <stop offset="100%" stop-color="#0A0604"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF3D6"/>
      <stop offset="35%" stop-color="#E2B170"/>
      <stop offset="70%" stop-color="#C68A4C"/>
      <stop offset="100%" stop-color="#8C5320"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#E2B170" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Outer Ring -->
  <circle cx="150" cy="150" r="142" fill="url(#bgGrad)" stroke="url(#goldGrad)" stroke-width="6"/>
  <circle cx="150" cy="150" r="132" fill="none" stroke="#C68A4C" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.6"/>

  <!-- Three Intersecting Hearts Symbol -->
  <g transform="translate(150, 140) scale(0.9)" filter="url(#glow)">
    <!-- Left Heart -->
    <path d="M -16,-12 C -28,-28 -48,-10 -48,8 C -48,28 -18,46 0,60 C -8,42 -16,24 -16,8 C -16,-2 -8,-8 -16,-12 Z" fill="url(#goldGrad)" opacity="0.8"/>
    <!-- Right Heart -->
    <path d="M 16,-12 C 28,-28 48,-10 48,8 C 48,28 18,46 0,60 C 8,42 16,24 16,8 C 16,-2 8,-8 16,-12 Z" fill="url(#goldGrad)" opacity="0.8"/>
    <!-- Center Main Heart -->
    <path d="M 0,-12 C -22,-36 -44,-8 -30,16 C -18,34 0,55 0,55 C 0,55 18,34 30,16 C 44,-8 22,-36 0,-12 Z" fill="url(#goldGrad)"/>
    <!-- Inner Cutout -->
    <path d="M 0,-4 C -14,-20 -28,-4 -18,10 C -10,22 0,38 0,38 C 0,38 10,22 18,10 C 28,-4 14,-20 0,-4 Z" fill="#1C120B"/>
  </g>

  <!-- Top Text -->
  <path id="topTextArc" d="M 45,150 A 105,105 0 0,1 255,150" fill="none"/>
  <text font-family="'Cinzel', 'Georgia', serif" font-size="13.5" font-weight="900" fill="url(#goldGrad)" letter-spacing="3" text-anchor="middle">
    <textPath href="#topTextArc" startOffset="50%">CAFÉ TRÊS CORAÇÕES</textPath>
  </text>

  <!-- Bottom Text -->
  <path id="bottomTextArc" d="M 255,150 A 105,105 0 0,1 45,150" fill="none"/>
  <text font-family="'Cinzel', 'Georgia', serif" font-size="10.5" font-weight="700" fill="#E2B170" letter-spacing="4" text-anchor="middle">
    <textPath href="#bottomTextArc" startOffset="50%">★ DESDE 1959 ★</textPath>
  </text>
</svg>
`)}`;

import mapaBrasil from './mapa-brasil.png';

export const ASSETS = {
  badgeLogo: badgeLogoSvg,
  heroBanner: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1600&q=80',
  nightMap: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80',
  espressoCard: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
  cristianeAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  mapaBrasil,
};

