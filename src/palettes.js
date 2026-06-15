export const SKIN_TONES = {
  light: '#f6d7c3',
  mediumLight: '#e8b98f',
  medium: '#c9865a',
  mediumDark: '#8d5524',
  dark: '#5c3424'
};

export const HAIR_COLORS = {
  black: '#1f1b18',
  brown: '#5b3824',
  blonde: '#d8ad4f',
  red: '#a8482f',
  gray: '#8d8d8d',
  white: '#e9e4d5'
};

export const BACKGROUNDS = [
  '#f3e8ff',
  '#dbeafe',
  '#dcfce7',
  '#fef3c7',
  '#fee2e2',
  '#e0f2fe',
  '#fce7f3',
  '#ede9fe'
];

export const SHAPE_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#ea580c',
  '#16a34a',
  '#0891b2',
  '#4f46e5',
  '#be123c'
];

export const CLOTHING_COLORS = [
  '#2563eb',
  '#dc2626',
  '#16a34a',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#475569',
  '#d97706'
];

// Expression presets map onto the expressive traits (eyes/mouth/eyebrows) while
// leaving identity traits (skin, hair, …) seed-derived. Explicit per-trait
// values still take precedence over an expression. Affects the face styles.
export const EXPRESSIONS = {
  neutral: { eyes: 'round', mouth: 'neutral', eyebrows: 'flat' },
  happy: { eyes: 'smile', mouth: 'smile', eyebrows: 'raised' },
  sad: { eyes: 'sleepy', mouth: 'neutral', eyebrows: 'angled' },
  surprised: { eyes: 'round', mouth: 'open', eyebrows: 'raised' },
  thinking: { eyes: 'sleepy', mouth: 'neutral', eyebrows: 'raised' },
  wink: { eyes: 'wink', mouth: 'smile', eyebrows: 'flat' }
};

export const AVATAR_OPTIONS = {
  style: ['portrait', 'studio', 'cartoon', 'minimal', 'line', 'pixel', 'initials', 'bot', 'shapes', 'mesh'],
  expression: Object.keys(EXPRESSIONS),
  gender: ['neutral', 'feminine', 'masculine'],
  skinTone: Object.keys(SKIN_TONES),
  faceShape: ['round', 'oval', 'soft'],
  hairStyle: ['none', 'stubble', 'short', 'long', 'curly', 'coily', 'bun', 'afro', 'mohawk', 'spiky', 'hijab'],
  hairColor: Object.keys(HAIR_COLORS),
  eyebrows: ['flat', 'raised', 'angled'],
  eyes: ['round', 'smile', 'sleepy', 'wink'],
  nose: ['soft', 'button', 'wide'],
  mouth: ['smile', 'neutral', 'open'],
  facialHair: ['none', 'stubble', 'mustache', 'goatee', 'beard', 'fullBeard', 'sideburns'],
  freckles: ['none', 'light', 'heavy'],
  blush: ['none', 'soft'],
  headwear: ['none', 'beanie', 'cap', 'turban', 'bucket', 'hijab'],
  earrings: ['none', 'studs', 'hoops'],
  accessories: ['none', 'glasses', 'sunglasses']
};

export const OPTION_ALIASES = {
  hair: 'hairStyle'
};

// `face` was renamed to `cartoon` in v0.5; the old name still resolves.
export const STYLE_ALIASES = {
  face: 'cartoon'
};

// The style used when none is requested.
export const DEFAULT_STYLE = 'portrait';

// Dark inks used by the monochrome `line` style.
export const INKS = ['#18181b', '#1e293b', '#3f3f46', '#292524', '#1f2937', '#374151'];

// The default color sets. A caller can override any of these via the `palette`
// option; resolvePalette merges the override over the defaults.
export const DEFAULT_PALETTE = {
  skinTones: SKIN_TONES,
  hairColors: HAIR_COLORS,
  backgrounds: BACKGROUNDS,
  shapeColors: SHAPE_COLORS,
  clothingColors: CLOTHING_COLORS,
  inks: INKS
};

// A colorblind-safe preset based on the Okabe–Ito qualitative palette, whose
// hues stay distinguishable across the common color-vision deficiencies. It
// recolors the abstract styles, clothing, and inks; skin and hair keep their
// natural tones. Opt in with `palette: 'accessible'` (or pass this object).
export const COLORBLIND_SAFE_PALETTE = {
  backgrounds: ['#F2F2F2', '#E4F1FA', '#E3F3EC', '#FBF1DA', '#F6E7EF'],
  shapeColors: ['#0072B2', '#D55E00', '#009E73', '#CC79A7', '#E69F00', '#56B4E9'],
  clothingColors: ['#0072B2', '#D55E00', '#009E73', '#CC79A7', '#E69F00'],
  inks: ['#000000', '#0072B2', '#D55E00']
};

// Named palette presets resolvable by string (e.g. `palette: 'accessible'`).
export const PALETTE_PRESETS = {
  accessible: COLORBLIND_SAFE_PALETTE,
  'colorblind-safe': COLORBLIND_SAFE_PALETTE
};

function list(override, fallback) {
  return Array.isArray(override) && override.length ? override : fallback;
}

export function resolvePalette(override) {
  if (typeof override === 'string') {
    override = PALETTE_PRESETS[override];
  }

  if (!override) {
    return DEFAULT_PALETTE;
  }

  return {
    skinTones: { ...SKIN_TONES, ...(override.skinTones || {}) },
    hairColors: { ...HAIR_COLORS, ...(override.hairColors || {}) },
    backgrounds: list(override.backgrounds, BACKGROUNDS),
    shapeColors: list(override.shapeColors, SHAPE_COLORS),
    clothingColors: list(override.clothingColors, CLOTHING_COLORS),
    inks: list(override.inks, INKS)
  };
}
