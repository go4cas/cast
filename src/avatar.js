import { BACKGROUNDS, AVATAR_OPTIONS, OPTION_ALIASES } from './palettes.js';
import { createRandom, decodeObject, encodeObject, hashConfig, pick } from './hash.js';
import { renderAbstractAvatar } from './styles/abstract.js';
import { renderFaceAvatar } from './styles/face.js';
import { renderInitialsAvatar } from './styles/initials.js';
import { renderShapesAvatar } from './styles/shapes.js';

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

function chooseBackground(background, random) {
  if (background && background !== 'auto') {
    return background;
  }

  return pick(BACKGROUNDS, random);
}

function normalizeInput(seedOrOptions = {}, maybeOptions = {}) {
  if (typeof seedOrOptions === 'string' || typeof seedOrOptions === 'number') {
    return { ...maybeOptions, seed: String(seedOrOptions) };
  }

  return { ...seedOrOptions };
}

function normalizeTraits(options, random) {
  const rawTraits = options.traits || {};
  const aliased = Object.fromEntries(
    Object.entries(OPTION_ALIASES).map(([from, to]) => [to, options[from]])
  );
  const traits = { ...aliased, ...options, ...rawTraits };

  const hairStyle = optionOrAuto(traits.hairStyle, AVATAR_OPTIONS.hairStyle, random);
  const headwear = traits.headwear === undefined && hairStyle === 'hijab'
    ? 'hijab'
    : optionOrAuto(traits.headwear, AVATAR_OPTIONS.headwear, random);

  return {
    gender: optionOrAuto(traits.gender, AVATAR_OPTIONS.gender, random),
    skinTone: optionOrAuto(traits.skinTone, AVATAR_OPTIONS.skinTone, random),
    faceShape: optionOrAuto(traits.faceShape, AVATAR_OPTIONS.faceShape, random),
    hairStyle,
    hairColor: optionOrAuto(traits.hairColor, AVATAR_OPTIONS.hairColor, random),
    eyes: optionOrAuto(traits.eyes, AVATAR_OPTIONS.eyes, random),
    mouth: optionOrAuto(traits.mouth, AVATAR_OPTIONS.mouth, random),
    facialHair: optionOrAuto(traits.facialHair, AVATAR_OPTIONS.facialHair, random),
    headwear,
    accessories: optionOrAuto(traits.accessories, AVATAR_OPTIONS.accessories, random)
  };
}

export function resolveAvatarOptions(seedOrOptions = {}, maybeOptions = {}) {
  const options = normalizeInput(seedOrOptions, maybeOptions);
  const seed = String(options.seed ?? options.name ?? options.id ?? 'avatar');
  const random = createRandom(`${seed}:${hashConfig(options)}`);
  const style = optionOrAuto(options.style, AVATAR_OPTIONS.style, random);

  return {
    version: 1,
    seed,
    style,
    size: clampSize(options.size),
    traits: normalizeTraits(options, random),
    background: chooseBackground(options.background, random),
    radius: options.radius ?? '50%',
    title: options.title ?? `${seed} avatar`,
    initials: options.initials
  };
}

export function avatarHash(seedOrOptions = {}, maybeOptions = {}) {
  return hashConfig(resolveAvatarOptions(seedOrOptions, maybeOptions));
}

export function encodeAvatar(seedOrOptions = {}, maybeOptions = {}) {
  const config = resolveAvatarOptions(seedOrOptions, maybeOptions);
  return `${CONFIG_PREFIX}.${avatarHash(config)}.${encodeObject(config)}`;
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

  if (config.style === 'initials') {
    return renderInitialsAvatar(config);
  }

  if (config.style === 'shapes') {
    return renderShapesAvatar(config);
  }

  if (config.style === 'abstract') {
    return renderAbstractAvatar(config);
  }

  return renderFaceAvatar(config);
}

export function toDataUri(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function createAvatarDataUri(seedOrOptions = {}, maybeOptions = {}) {
  return toDataUri(createAvatar(seedOrOptions, maybeOptions));
}

export function createAvatarElement(seedOrOptions = {}, maybeOptions = {}) {
  const template = document.createElement('template');
  template.innerHTML = createAvatar(seedOrOptions, maybeOptions).trim();
  return template.content.firstElementChild;
}

export function mountAvatar(target, seedOrOptions = {}, maybeOptions = {}) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;

  if (!element) {
    throw new Error('mountAvatar target was not found.');
  }

  const svg = createAvatar(seedOrOptions, maybeOptions);
  element.innerHTML = svg;
  return svg;
}

export const avatarOptions = AVATAR_OPTIONS;
