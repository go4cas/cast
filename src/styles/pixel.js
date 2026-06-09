import { createRandom, pick } from '../hash.js';
import { HAIR_COLORS, SKIN_TONES } from '../palettes.js';
import { shapeColor, svgFrame } from './common.js';

// 8-bit pixel-art character (inspired by DiceBear's pixel-art): a blocky face
// built on a 12x12 grid with seeded skin/hair/clothing colors and variation in
// hair style and facial hair. CELL/ORIGIN center the grid inside the 128 frame.
const CELL = 8;
const ORIGIN = 16;

function px(col, row, cols, rows, fill) {
  return `<rect x="${ORIGIN + col * CELL}" y="${ORIGIN + row * CELL}" width="${cols * CELL}" height="${rows * CELL}" fill="${fill}"/>`;
}

export function renderPixelAvatar(config) {
  const random = createRandom(`${config.seed}:pixel`);
  const skin = SKIN_TONES[pick(Object.keys(SKIN_TONES), random)];
  const hair = HAIR_COLORS[pick(Object.keys(HAIR_COLORS), random)];
  const clothing = shapeColor(random, 2);
  const hatColor = shapeColor(random, 5);
  const hairStyle = pick(['flat', 'tall', 'side', 'long', 'none'], random);
  const hat = pick(['none', 'none', 'none', 'beanie', 'cap'], random);
  const hasBeard = random() > 0.65;
  const hasGlasses = random() > 0.5;

  const parts = [];

  // face + ears
  parts.push(px(2, 3, 8, 7, skin));
  parts.push(px(1, 5, 1, 2, skin));
  parts.push(px(10, 5, 1, 2, skin));

  // hair
  if (hairStyle !== 'none') {
    parts.push(px(2, 1, 8, 2, hair));
    parts.push(px(2, 3, 8, 1, hair));
    if (hairStyle === 'tall') {
      parts.push(px(3, 0, 6, 1, hair));
    }
    if (hairStyle === 'side') {
      parts.push(px(2, 4, 1, 2, hair));
    }
    if (hairStyle === 'long') {
      parts.push(px(2, 4, 1, 4, hair));
      parts.push(px(9, 4, 1, 4, hair));
    }
  }

  // hat (drawn over the hair crown)
  if (hat === 'beanie') {
    parts.push(px(2, 1, 8, 2, hatColor));
    parts.push(px(2, 3, 8, 1, hatColor));
  } else if (hat === 'cap') {
    parts.push(px(3, 1, 6, 2, hatColor));
    parts.push(px(1, 3, 8, 1, hatColor));
  }

  // beard (drawn under the mouth so the mouth stays visible)
  if (hasBeard) {
    parts.push(px(2, 8, 8, 2, hair));
    parts.push(px(3, 7, 1, 1, hair));
    parts.push(px(8, 7, 1, 1, hair));
  }

  // eyes (or glasses) + mouth
  if (hasGlasses) {
    parts.push(px(3, 6, 6, 1, '#1f2937'));
    parts.push(px(4, 6, 1, 1, '#e5e7eb'));
    parts.push(px(7, 6, 1, 1, '#e5e7eb'));
  } else {
    parts.push(px(4, 6, 1, 1, '#1f2937'));
    parts.push(px(7, 6, 1, 1, '#1f2937'));
  }
  parts.push(px(5, 8, 2, 1, '#7f1d1d'));

  // clothing + neck
  parts.push(px(1, 10, 10, 2, clothing));
  parts.push(px(5, 10, 2, 1, skin));

  return svgFrame(config, parts.join(''));
}
