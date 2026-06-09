import { SHAPE_COLORS } from '../palettes.js';
import { hashString } from '../hash.js';

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
  // Clip every style to the background shape so content (e.g. the face's
  // shoulders/hair) can never spill outside the rounded frame. The id is
  // derived from the config so multiple inlined avatars on one page don't
  // share a clip path.
  const clipId = `cast-clip-${hashString(`${config.seed}:${config.style}:${config.radius}`).toString(36)}`;
  return `<svg xmlns="${SVG_NS}" width="${size}" height="${size}" viewBox="0 0 128 128" role="img" aria-label="${escapeText(config.title)}"><defs><clipPath id="${clipId}"><rect width="128" height="128" rx="${radius}"/></clipPath></defs><g clip-path="url(#${clipId})"><rect width="128" height="128" rx="${radius}" fill="${escapeText(config.background)}"/>${children}</g></svg>`;
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
