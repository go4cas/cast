import { AVATAR_OPTIONS, OPTION_ALIASES, STYLE_ALIASES, DEFAULT_STYLE, EXPRESSIONS, resolvePalette } from './palettes.js';
import { createRandom, decodeObject, encodeObject, hashConfig, pick } from './hash.js';
import { renderCartoonAvatar } from './styles/cartoon.js';
import { renderPortraitAvatar } from './styles/portrait.js';
import { renderStudioAvatar } from './styles/studio.js';
import { renderMinimalAvatar } from './styles/minimal.js';
import { renderLineAvatar } from './styles/line.js';
import { renderInitialsAvatar } from './styles/initials.js';
import { renderShapesAvatar } from './styles/shapes.js';
import { renderPixelAvatar } from './styles/pixel.js';
import { renderBotAvatar } from './styles/bot.js';
import { renderMeshAvatar } from './styles/mesh.js';

const RENDERERS = {
  cartoon: renderCartoonAvatar,
  portrait: renderPortraitAvatar,
  studio: renderStudioAvatar,
  minimal: renderMinimalAvatar,
  line: renderLineAvatar,
  pixel: renderPixelAvatar,
  initials: renderInitialsAvatar,
  bot: renderBotAvatar,
  shapes: renderShapesAvatar,
  mesh: renderMeshAvatar
};

const CONFIG_PREFIX = 'ca1';

function clampSize(size) {
  const numeric = Number(size);
  if (!Number.isFinite(numeric)) {
    return 128;
  }

  return Math.min(1024, Math.max(24, Math.round(numeric)));
}

function optionOrAuto(option, values, random) {
  if (option === 'auto' || option === undefined || option === null) {
    return pick(values, random);
  }

  return values.includes(option) ? option : pick(values, random);
}

function chooseColor(value, palette, random) {
  if (value && value !== 'auto') {
    return value;
  }

  return pick(palette, random);
}

function normalizeInput(seedOrOptions = {}, maybeOptions = {}) {
  if (typeof seedOrOptions === 'string' || typeof seedOrOptions === 'number') {
    return { ...maybeOptions, seed: String(seedOrOptions) };
  }

  return { ...seedOrOptions };
}

// A hijab hairstyle implies hijab headwear unless the caller explicitly
// requests different headwear. Centralized here so every renderer can trust
// config.traits.headwear without re-deriving the coupling.
function resolveHeadwear(headwear, hairStyle, random) {
  if ((headwear === undefined || headwear === 'none') && hairStyle === 'hijab') {
    return 'hijab';
  }

  return optionOrAuto(headwear, AVATAR_OPTIONS.headwear, random);
}

function normalizeTraits(options, draw, palette) {
  const rawTraits = options.traits || {};
  const aliased = Object.fromEntries(
    Object.entries(OPTION_ALIASES).map(([from, to]) => [to, options[from]])
  );
  const traits = { ...aliased, ...options, ...rawTraits };

  // An `expression` presets eyes/mouth/eyebrows; explicit traits still win.
  const expr = EXPRESSIONS[options.expression] || {};
  const expressive = (key) => (traits[key] !== undefined ? traits[key] : expr[key]);

  const hairStyle = optionOrAuto(traits.hairStyle, AVATAR_OPTIONS.hairStyle, draw('hairStyle'));

  return {
    // `clothing` is the one free-color trait (a CSS color rather than an enum);
    // legacy top-level `clothing` is still accepted via the merge above.
    clothing: chooseColor(traits.clothing, palette.clothingColors, draw('clothing')),
    gender: optionOrAuto(traits.gender, AVATAR_OPTIONS.gender, draw('gender')),
    skinTone: optionOrAuto(traits.skinTone, AVATAR_OPTIONS.skinTone, draw('skinTone')),
    faceShape: optionOrAuto(traits.faceShape, AVATAR_OPTIONS.faceShape, draw('faceShape')),
    hairStyle,
    hairColor: optionOrAuto(traits.hairColor, AVATAR_OPTIONS.hairColor, draw('hairColor')),
    eyebrows: optionOrAuto(expressive('eyebrows'), AVATAR_OPTIONS.eyebrows, draw('eyebrows')),
    eyes: optionOrAuto(expressive('eyes'), AVATAR_OPTIONS.eyes, draw('eyes')),
    nose: optionOrAuto(traits.nose, AVATAR_OPTIONS.nose, draw('nose')),
    mouth: optionOrAuto(expressive('mouth'), AVATAR_OPTIONS.mouth, draw('mouth')),
    facialHair: optionOrAuto(traits.facialHair, AVATAR_OPTIONS.facialHair, draw('facialHair')),
    freckles: optionOrAuto(traits.freckles, AVATAR_OPTIONS.freckles, draw('freckles')),
    blush: optionOrAuto(traits.blush, AVATAR_OPTIONS.blush, draw('blush')),
    headwear: resolveHeadwear(traits.headwear, hairStyle, draw('headwear')),
    earrings: optionOrAuto(traits.earrings, AVATAR_OPTIONS.earrings, draw('earrings')),
    accessories: optionOrAuto(traits.accessories, AVATAR_OPTIONS.accessories, draw('accessories'))
  };
}

export function resolveAvatarOptions(seedOrOptions = {}, maybeOptions = {}) {
  const options = normalizeInput(seedOrOptions, maybeOptions);
  const seed = String(options.seed ?? options.name ?? options.id ?? 'avatar');
  // Each generated field draws from its own stream keyed by the identity seed
  // alone, so render-only options (size, radius, title, background) never
  // change the avatar's identity, and specifying one trait never reshuffles
  // the others.
  const draw = (field) => createRandom(`${seed}:${field}`);
  const palette = resolvePalette(options.palette);
  // No style requested -> the default; otherwise resolve aliases (e.g. face -> cartoon).
  const requestedStyle = options.style == null ? DEFAULT_STYLE : (STYLE_ALIASES[options.style] || options.style);
  const style = optionOrAuto(requestedStyle, AVATAR_OPTIONS.style, draw('style'));

  return {
    version: 1,
    seed,
    style,
    size: clampSize(options.size),
    traits: normalizeTraits(options, draw, palette),
    background: chooseColor(options.background, palette.backgrounds, draw('background')),
    // Stored raw (and dropped from the hash when absent) so a decoded avatar
    // re-renders with the same custom palette.
    palette: options.palette,
    radius: options.radius ?? '50%',
    title: options.title ?? `${seed} avatar`,
    initials: options.initials,
    // Monogram styling for the `initials` style (undefined when unused).
    fontWeight: options.fontWeight,
    fontFamily: options.fontFamily,
    // Presence overlay; left undefined (and dropped from the hash) when unused.
    status: options.status
  };
}

export function avatarHash(seedOrOptions = {}, maybeOptions = {}) {
  return hashConfig(resolveAvatarOptions(seedOrOptions, maybeOptions));
}

export function encodeAvatar(seedOrOptions = {}, maybeOptions = {}) {
  const config = resolveAvatarOptions(seedOrOptions, maybeOptions);
  return `${CONFIG_PREFIX}.${hashConfig(config)}.${encodeObject(config)}`;
}

export function decodeAvatar(encoded) {
  const [prefix, hash, payload] = String(encoded).split('.');

  if (prefix !== CONFIG_PREFIX || !hash || !payload) {
    throw new Error('Invalid avatar config string.');
  }

  let config;

  try {
    config = decodeObject(payload);
  } catch (error) {
    throw new Error('Invalid avatar config payload.');
  }

  const expectedHash = hashConfig(config);

  if (expectedHash !== hash) {
    throw new Error('Avatar config hash mismatch.');
  }

  return config;
}

export function createAvatar(seedOrOptions = {}, maybeOptions = {}) {
  const config = seedOrOptions?.version === 1 && seedOrOptions?.traits
    ? seedOrOptions
    : resolveAvatarOptions(seedOrOptions, maybeOptions);

  const style = STYLE_ALIASES[config.style] || config.style;
  return (RENDERERS[style] || renderPortraitAvatar)(config);
}

// Render many avatars at once. Each item is a seed (string/number) or an
// options object; `sharedOptions` is merged under every item. Returns an array
// of SVG strings in input order.
export function createAvatars(items = [], sharedOptions = {}) {
  return items.map((item) => {
    if (typeof item === 'string' || typeof item === 'number') {
      return createAvatar(item, sharedOptions);
    }

    return createAvatar({ ...sharedOptions, ...item });
  });
}

// Render a roster of avatars into a single SVG sprite sheet (a grid of nested
// SVGs). Layout options: `columns`, `cell` (px per avatar), `gap`. Remaining
// options are shared across every avatar.
export function createAvatarSprite(items = [], options = {}) {
  const { columns = 8, cell = 64, gap = 8, ...shared } = options;
  const svgs = createAvatars(items, { ...shared, size: cell });
  const cols = Math.max(1, Math.floor(columns));
  const stride = cell + gap;
  const width = Math.max(0, Math.min(cols, svgs.length) * stride - gap);
  const height = Math.max(0, Math.ceil(svgs.length / cols) * stride - gap);

  const cells = svgs.map((svg, index) => {
    const x = (index % cols) * stride;
    const y = Math.floor(index / cols) * stride;
    return svg.replace('<svg ', `<svg x="${x}" y="${y}" `);
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${cells.join('')}</svg>`;
}

export function toDataUri(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function createAvatarDataUri(seedOrOptions = {}, maybeOptions = {}) {
  return toDataUri(createAvatar(seedOrOptions, maybeOptions));
}

export function createAvatarElement(seedOrOptions = {}, maybeOptions = {}) {
  if (typeof document === 'undefined') {
    throw new Error('createAvatarElement requires a DOM environment. Use createAvatar for an SVG string.');
  }

  const template = document.createElement('template');
  template.innerHTML = createAvatar(seedOrOptions, maybeOptions).trim();
  return template.content.firstElementChild;
}

export function mountAvatar(target, seedOrOptions = {}, maybeOptions = {}) {
  if (typeof document === 'undefined') {
    throw new Error('mountAvatar requires a DOM environment. Use createAvatar for an SVG string.');
  }

  const element = typeof target === 'string' ? document.querySelector(target) : target;

  if (!element) {
    throw new Error('mountAvatar target was not found.');
  }

  const svg = createAvatar(seedOrOptions, maybeOptions);
  element.innerHTML = svg;
  return svg;
}

export const avatarOptions = AVATAR_OPTIONS;
