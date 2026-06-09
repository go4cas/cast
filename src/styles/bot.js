import { createRandom, pick } from '../hash.js';
import { shapeColor, svgFrame } from './common.js';

// Geometric robot face composed from primitives: a body color and an accent
// "screen" color, with seeded variation in the eye and mouth hardware.
export function renderBotAvatar(config) {
  const random = createRandom(`${config.seed}:bot`);
  const body = shapeColor(random);
  const accent = shapeColor(random, 4);

  const antenna = `<path d="M64 34V20" stroke="${body}" stroke-width="4" stroke-linecap="round"/><circle cx="64" cy="16" r="5" fill="${accent}"/>`;
  const ears = `<rect x="20" y="54" width="8" height="22" rx="3" fill="${body}"/><rect x="100" y="54" width="8" height="22" rx="3" fill="${body}"/>`;
  const head = `<rect x="28" y="34" width="72" height="62" rx="14" fill="${body}"/>`;
  const panel = `<rect x="38" y="44" width="52" height="30" rx="8" fill="#0f172a" opacity="0.85"/>`;

  const eyeType = pick(['round', 'square', 'visor'], random);
  let eyes;
  if (eyeType === 'round') {
    eyes = `<circle cx="52" cy="59" r="6" fill="${accent}"/><circle cx="76" cy="59" r="6" fill="${accent}"/>`;
  } else if (eyeType === 'square') {
    eyes = `<rect x="46" y="53" width="12" height="12" rx="2" fill="${accent}"/><rect x="70" y="53" width="12" height="12" rx="2" fill="${accent}"/>`;
  } else {
    eyes = `<rect x="44" y="55" width="40" height="8" rx="4" fill="${accent}"/>`;
  }

  const mouthType = pick(['grille', 'line', 'smile'], random);
  let mouth;
  if (mouthType === 'grille') {
    mouth = [50, 57, 64, 71, 78].map((x) => `<rect x="${x}" y="82" width="3" height="9" rx="1" fill="${accent}"/>`).join('');
  } else if (mouthType === 'line') {
    mouth = `<rect x="50" y="85" width="28" height="4" rx="2" fill="${accent}"/>`;
  } else {
    mouth = `<path d="M50 84q14 10 28 0" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>`;
  }

  return svgFrame(config, [antenna, ears, head, panel, eyes, mouth].join(''));
}
