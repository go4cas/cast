import { resolvePalette } from '../palettes.js';
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
  const palette = resolvePalette(config.palette);

  // Clip every style to the background shape so content (e.g. the face's
  // shoulders/hair) can never spill outside the rounded frame.
  let defs = `<clipPath id="${clipId}"><rect width="128" height="128" rx="${radius}"/></clipPath>`;
  let background;

  if (config.background === 'transparent') {
    background = '';
  } else if (config.background === 'gradient') {
    const gradId = `cast-grad-${uid}`;
    const random = createRandom(`${config.seed}:gradient`);
    const from = colorAt(palette.backgrounds, random);
    const to = colorAt(palette.backgrounds, random, 3);
    defs += `<linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient>`;
    background = `<rect width="128" height="128" rx="${radius}" fill="url(#${gradId})"/>`;
  } else if (config.background === 'dots' || config.background === 'rings' || config.background === 'grid') {
    const patId = `cast-pat-${uid}`;
    const random = createRandom(`${config.seed}:pattern`);
    const base = colorAt(palette.backgrounds, random);
    const motif = colorAt(palette.shapeColors, random, 2);
    let shape;
    if (config.background === 'dots') {
      shape = `<circle cx="8" cy="8" r="2.5" fill="${motif}" opacity="0.25"/>`;
    } else if (config.background === 'rings') {
      shape = `<circle cx="8" cy="8" r="5" fill="none" stroke="${motif}" stroke-width="1.5" opacity="0.3"/>`;
    } else {
      shape = `<path d="M16 0H0V16" fill="none" stroke="${motif}" stroke-width="1.5" opacity="0.3"/>`;
    }
    defs += `<pattern id="${patId}" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="${base}"/>${shape}</pattern>`;
    background = `<rect width="128" height="128" rx="${radius}" fill="url(#${patId})"/>`;
  } else {
    background = `<rect width="128" height="128" rx="${radius}" fill="${escapeText(config.background)}"/>`;
  }

  const anim = animation(config.animate, uid);
  // Accessibility: by default the avatar is an image with an accessible name
  // (and a native <title> tooltip). When `decorative` is set it is hidden from
  // assistive tech instead — use that when adjacent text already names it.
  const label = escapeText(config.title);
  const a11y = config.decorative ? ' aria-hidden="true"' : ` role="img" aria-label="${label}"`;
  const titleEl = config.decorative ? '' : `<title>${label}</title>`;
  // The `blink` animation scopes its CSS to this avatar via a root id so it only
  // animates its own eyes, not every avatar on the page.
  const rootId = config.animate === 'blink' ? ` id="cast-${uid}"` : '';
  return `<svg xmlns="${SVG_NS}" width="${size}" height="${size}" viewBox="0 0 128 128"${rootId}${a11y}>${titleEl}<defs>${defs}</defs>${anim.css}<g clip-path="url(#${clipId})">${background}${anim.open}${children}${anim.close}</g>${statusBadge(config.status, radius)}</svg>`;
}

// Wrap the eyes so the `blink` animation can target them. A no-op (and no markup
// change) for any other animate value, keeping existing output stable.
export function eyeGroup(config, eyesSvg) {
  return config && config.animate === 'blink' ? `<g class="cast-eyes">${eyesSvg}</g>` : eyesSvg;
}

// Optional, deterministic CSS animation applied to the avatar content (not the
// frame). Respects prefers-reduced-motion. Keyframe/class names are namespaced
// by `uid` so multiple inlined avatars don't clash.
function animation(animate, uid) {
  if (animate === 'blink') {
    // Eyes (wrapped in .cast-eyes by the face renderers) briefly close. Scoped
    // to this avatar's root id so it never blinks other avatars on the page.
    const cls = `cast-blink-${uid}`;
    const keyframes = `@keyframes ${cls}{0%,90%,100%{transform:scaleY(1)}95%{transform:scaleY(0.08)}}`;
    const css = `<style>${keyframes}@media(prefers-reduced-motion:no-preference){#cast-${uid} .cast-eyes{transform-box:fill-box;transform-origin:center;animation:${cls} 4s ease-in-out infinite}}</style>`;
    return { css, open: '', close: '' };
  }

  if (animate !== 'breathe' && animate !== 'bounce') {
    return { css: '', open: '', close: '' };
  }

  const cls = `cast-anim-${uid}`;
  const keyframes = animate === 'bounce'
    ? `@keyframes ${cls}{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}`
    : `@keyframes ${cls}{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}`;
  const duration = animate === 'bounce' ? '1.8s' : '3.6s';
  const css = `<style>${keyframes}@media(prefers-reduced-motion:no-preference){.${cls}{transform-box:fill-box;transform-origin:center;animation:${cls} ${duration} ease-in-out infinite}}</style>`;

  return { css, open: `<g class="${cls}">`, close: '</g>' };
}

const STATUS_COLORS = { online: '#22c55e', busy: '#ef4444', away: '#f59e0b', offline: '#94a3b8' };
const STATUS_POSITIONS = {
  'top-left': [26, 26],
  'top-right': [102, 26],
  'bottom-left': [26, 102],
  'bottom-right': [102, 102]
};

// A presence badge drawn on top of (and outside the clip of) the avatar.
// `status` is omitted (no badge) unless set, and accepts either a state string
// (`'online'`) or an object `{ state, shape, position, pulse }`.
function statusBadge(status, radius) {
  if (!status) {
    return '';
  }

  const config = typeof status === 'string' ? { state: status } : status;
  const color = STATUS_COLORS[config.state];

  if (!color) {
    return '';
  }

  if (config.shape === 'ring') {
    const pulse = config.pulse
      ? '<animate attributeName="opacity" values="1;0.35;1" dur="1.6s" repeatCount="indefinite"/>'
      : '';
    return `<rect x="3" y="3" width="122" height="122" rx="${radius}" fill="none" stroke="${color}" stroke-width="6">${pulse}</rect>`;
  }

  const [cx, cy] = STATUS_POSITIONS[config.position] || STATUS_POSITIONS['bottom-right'];
  const pulse = config.pulse
    ? `<circle cx="${cx}" cy="${cy}" r="10" fill="${color}" opacity="0.55"><animate attributeName="r" values="10;20" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.55;0" dur="1.5s" repeatCount="indefinite"/></circle>`
    : '';
  const glyph = config.icon ? statusGlyph(config.state, cx, cy) : '';
  return `${pulse}<circle cx="${cx}" cy="${cy}" r="14" fill="#fff"/><circle cx="${cx}" cy="${cy}" r="10" fill="${color}"/>${glyph}`;
}

// Opt-in shape affordance so the badge state is distinguishable without relying
// on color alone (a white glyph on the dot): check / minus / clock / cross.
function statusGlyph(state, cx, cy) {
  const s = 'fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
  if (state === 'online') return `<path d="M${cx - 4} ${cy + 0.5}l3 3.2l5.5 -6" ${s}/>`;
  if (state === 'busy') return `<path d="M${cx - 4.5} ${cy}h9" ${s}/>`;
  if (state === 'away') return `<path d="M${cx} ${cy}V${cy - 4}M${cx} ${cy}h3.6" ${s}/>`;
  return `<path d="M${cx - 3.4} ${cy - 3.4}l6.8 6.8M${cx + 3.4} ${cy - 3.4}l-6.8 6.8" ${s}/>`;
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
