import { SHAPE_COLORS } from '../palettes.js';

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
  return `<svg xmlns="${SVG_NS}" width="${config.size}" height="${config.size}" viewBox="0 0 128 128" role="img" aria-label="${escapeText(config.title)}"><rect width="128" height="128" rx="${radius}" fill="${escapeText(config.background)}"/>${children}</svg>`;
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
