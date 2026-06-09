import { BACKGROUNDS, SHAPE_COLORS } from '../palettes.js';
import { createRandom, hashString } from '../hash.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export function escapeText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function svgFrame(config, children) {
  const radius = typeof config.radius === 'number' ? config.radius : escapeText(config.radius);
  const size = escapeText(config.size);
  // Ids are derived from the config so multiple inlined avatars on one page
  // don't share a clip path or gradient definition.
  const uid = hashString(`${config.seed}:${config.style}:${config.radius}`).toString(36);
  const clipId = `cast-clip-${uid}`;

  // Clip every style to the background shape so content (e.g. the face's
  // shoulders/hair) can never spill outside the rounded frame.
  let defs = `<clipPath id="${clipId}"><rect width="128" height="128" rx="${radius}"/></clipPath>`;
  let background;

  if (config.background === 'transparent') {
    background = '';
  } else if (config.background === 'gradient') {
    const gradId = `cast-grad-${uid}`;
    const random = createRandom(`${config.seed}:gradient`);
    const from = colorAt(BACKGROUNDS, random);
    const to = colorAt(BACKGROUNDS, random, 3);
    defs += `<linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient>`;
    background = `<rect width="128" height="128" rx="${radius}" fill="url(#${gradId})"/>`;
  } else {
    background = `<rect width="128" height="128" rx="${radius}" fill="${escapeText(config.background)}"/>`;
  }

  return `<svg xmlns="${SVG_NS}" width="${size}" height="${size}" viewBox="0 0 128 128" role="img" aria-label="${escapeText(config.title)}"><defs>${defs}</defs><g clip-path="url(#${clipId})">${background}${children}</g></svg>`;
}

export function colorAt(colors, random, offset = 0) {
  const index = Math.floor(random() * colors.length + offset) % colors.length;
  return colors[index];
}

export function initialsFrom(seed) {
  const words = String(seed || '?')
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);

  if (words.length === 0) {
    return '?';
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export function shapeColor(random, offset) {
  return colorAt(SHAPE_COLORS, random, offset);
}
