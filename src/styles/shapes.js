import { createRandom } from '../hash.js';
import { resolvePalette } from '../palettes.js';
import { colorAt, svgFrame } from './common.js';

export function renderShapesAvatar(config) {
  const random = createRandom(`${config.seed}:shapes`);
  const colors = resolvePalette(config.palette).shapeColors;
  const one = colorAt(colors, random);
  const two = colorAt(colors, random, 2);
  const three = colorAt(colors, random, 4);

  return svgFrame(config, [
    `<circle cx="42" cy="44" r="29" fill="${one}" opacity="0.92"/>`,
    `<rect x="52" y="37" width="52" height="52" rx="16" fill="${two}" opacity="0.86" transform="rotate(18 78 63)"/>`,
    `<path d="M26 101 63 37l39 64H26Z" fill="${three}" opacity="0.78"/>`,
    '<circle cx="84" cy="76" r="13" fill="#fff" opacity="0.7"/>'
  ].join(''));
}
