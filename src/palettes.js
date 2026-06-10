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

export const AVATAR_OPTIONS = {
  style: ['face', 'portrait', 'initials', 'shapes', 'pixel', 'bot'],
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
