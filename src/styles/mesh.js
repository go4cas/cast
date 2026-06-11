import { createRandom, hashString } from '../hash.js';
import { resolvePalette } from '../palettes.js';
import { colorAt, svgFrame } from './common.js';

// Abstract mesh-gradient avatar: a base color overlaid with several soft radial
// "blobs" that blend into a colorful gradient. No face — driven purely by the
// seed. Gradient ids are derived from the seed so inlined avatars don't collide.
export function renderMeshAvatar(config) {
  const random = createRandom(`${config.seed}:mesh`);
  const uid = hashString(`${config.seed}:mesh`).toString(36);
  const colors = resolvePalette(config.palette).shapeColors;
  const base = colorAt(colors, random);

  const defs = [];
  const blobs = [];

  for (let index = 0; index < 4; index += 1) {
    const color = colorAt(colors, random, index * 2);
    const cx = Math.round(20 + random() * 88);
    const cy = Math.round(20 + random() * 88);
    const r = Math.round(45 + random() * 45);
    const id = `cast-mesh-${uid}-${index}`;
    defs.push(`<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="0.9"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`);
    blobs.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>`);
  }

  const content = `<defs>${defs.join('')}</defs><rect width="128" height="128" fill="${base}"/>${blobs.join('')}`;
  return svgFrame(config, content);
}
