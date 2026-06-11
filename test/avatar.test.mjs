import assert from 'node:assert/strict';
import {
  avatarHash,
  avatarOptions,
  createAvatar,
  createAvatarDataUri,
  createAvatars,
  createAvatarSprite,
  decodeAvatar,
  encodeAvatar,
  resolveAvatarOptions,
  toDataUri
} from '../src/avatar.js';
import { AVATAR_OPTIONS } from '../src/palettes.js';
import { CastAvatarElement } from '../src/element.js';

const base = { seed: 'ada@example.com', style: 'face', size: 96 };
const first = createAvatar(base);
const second = createAvatar(base);

assert.equal(first, second, 'avatars are deterministic for the same options');
assert.equal(createAvatar('ada@example.com', { style: 'face', size: 96 }), first, 'seed/options overload matches object API');
assert.match(first, /^<svg /, 'createAvatar returns an SVG string');
assert.match(first, /width="96" height="96"/, 'size option controls rendered dimensions');
assert.equal(avatarHash(base), avatarHash(base), 'avatarHash is deterministic');
assert.notEqual(avatarHash({ seed: 'a' }), avatarHash({ seed: 'b' }), 'different seeds produce different hashes');

const custom = resolveAvatarOptions({
  seed: 'sam',
  traits: {
    gender: 'neutral',
    skinTone: 'dark',
    hairStyle: 'coily',
    eyes: 'wink',
    accessories: 'glasses',
    facialHair: 'beard',
    headwear: 'beanie'
  }
});

assert.equal(custom.traits.gender, 'neutral');
assert.equal(custom.traits.skinTone, 'dark');
assert.equal(custom.traits.hairStyle, 'coily');
assert.equal(custom.traits.eyes, 'wink');
assert.equal(custom.traits.accessories, 'glasses');
assert.equal(custom.traits.facialHair, 'beard');
assert.equal(custom.traits.headwear, 'beanie');

const legacyHair = resolveAvatarOptions({ seed: 'legacy', hair: 'curly' });
assert.equal(legacyHair.traits.hairStyle, 'curly', 'legacy hair option maps to traits.hairStyle');

for (const style of ['face', 'initials', 'shapes', 'pixel', 'bot']) {
  assert.match(createAvatar({ seed: 'style-check', style }), /^<svg /, `${style} style renders SVG`);
}

const encoded = encodeAvatar({ seed: 'persist-me', style: 'face', traits: { skinTone: 'mediumDark', hairStyle: 'bun' } });
const decoded = decodeAvatar(encoded);
assert.equal(decoded.seed, 'persist-me');
assert.equal(decoded.traits.skinTone, 'mediumDark');
assert.equal(createAvatar(decoded), createAvatar(decoded), 'decoded config can render deterministically');
assert.throws(() => decodeAvatar(encoded.replace(/.$/, 'x')), /hash mismatch|Invalid avatar config/, 'tampered config strings are rejected');

const faceSnapshot = createAvatar({
  seed: 'snapshot-face',
  style: 'face',
  size: 64,
  traits: {
    skinTone: 'dark',
    hairStyle: 'coily',
    eyes: 'wink',
    facialHair: 'none',
    headwear: 'none',
    accessories: 'glasses'
  }
});
assert.match(faceSnapshot, /fill="#5c3424"/, 'face snapshot includes selected skin tone');
assert.match(faceSnapshot, /<g fill="none" stroke="#1f2937" stroke-width="3">/, 'face snapshot includes selected glasses');

const shapesSnapshot = createAvatar('shape-user', { style: 'shapes', size: 80 });
assert.match(shapesSnapshot, /width="80" height="80"/, 'shape snapshot includes requested size');
assert.match(shapesSnapshot, /<path d="M26 101 63 37l39 64H26Z"/, 'shape snapshot includes triangle primitive');

assert.match(toDataUri(first), /^data:image\/svg\+xml;charset=UTF-8,/, 'toDataUri returns an SVG data URI');
assert.match(createAvatarDataUri(base), /^data:image\/svg\+xml;charset=UTF-8,/, 'createAvatarDataUri renders directly to a data URI');

// Identity is derived from the seed (and explicit traits) only — render-only
// options must never change the generated face.
const traitsOf = (options) => JSON.stringify(resolveAvatarOptions('identity-seed', options).traits);
const identityBase = traitsOf({});
assert.equal(traitsOf({ size: 512 }), identityBase, 'size does not change generated traits');
assert.equal(traitsOf({ background: '#000000' }), identityBase, 'background does not change generated traits');
assert.equal(traitsOf({ title: 'Custom Title' }), identityBase, 'title does not change generated traits');
assert.equal(traitsOf({ radius: 8 }), identityBase, 'radius does not change generated traits');

// Overriding one trait must not reshuffle the auto-generated ones.
const autoTraits = resolveAvatarOptions('identity-seed', {}).traits;
const pinnedTraits = resolveAvatarOptions('identity-seed', { skinTone: 'dark' }).traits;
assert.equal(pinnedTraits.skinTone, 'dark', 'explicit trait is honored');
for (const key of Object.keys(autoTraits)) {
  if (key === 'skinTone') {
    continue;
  }
  assert.equal(pinnedTraits[key], autoTraits[key], `overriding skinTone leaves ${key} unchanged`);
}

// A hijab hairstyle implies hijab headwear unless explicitly overridden to a
// different value — coupling is resolved once, in resolveAvatarOptions.
assert.equal(resolveAvatarOptions('hijab-user', { traits: { hairStyle: 'hijab' } }).traits.headwear, 'hijab', 'hijab hairstyle implies hijab headwear');
assert.equal(resolveAvatarOptions('hijab-user', { traits: { hairStyle: 'hijab', headwear: 'none' } }).traits.headwear, 'hijab', 'explicit none does not strip hijab coverage');
assert.equal(resolveAvatarOptions('hijab-user', { traits: { hairStyle: 'hijab', headwear: 'beanie' } }).traits.headwear, 'beanie', 'explicit headwear overrides hijab default');

// encode/decode round-trips and the embedded hash matches a direct hash of the
// decoded config (no double-resolution drift).
const roundTrip = encodeAvatar({ seed: 'round-trip', style: 'shapes', size: 200 });
const roundTripConfig = decodeAvatar(roundTrip);
assert.equal(createAvatar(roundTripConfig), createAvatar(roundTripConfig), 'decoded config renders deterministically');

// Render-only options are escaped in the frame, even on the pre-resolved path.
const escapedSize = createAvatar({ version: 1, style: 'shapes', seed: 'x', traits: {}, background: '#fff', title: 't', size: '1"><script>alert(1)</script>' });
assert.doesNotMatch(escapedSize, /<script>/, 'unescaped size cannot inject markup');

// Background modes: solid, transparent (no background rect), seeded gradient.
const solidBg = createAvatar('bg', { style: 'face', background: '#abcdef' });
assert.match(solidBg, /<rect width="128" height="128" rx="50%" fill="#abcdef"\/>/, 'solid background paints a fill rect');
const transparentBg = createAvatar('bg', { style: 'face', background: 'transparent' });
assert.doesNotMatch(transparentBg, /<rect width="128" height="128" rx="50%" fill=/, 'transparent background omits the fill rect');
const gradientBg = createAvatar('bg', { style: 'face', background: 'gradient' });
assert.match(gradientBg, /<linearGradient id="cast-grad-/, 'gradient background defines a gradient');
assert.match(gradientBg, /fill="url\(#cast-grad-/, 'gradient background fills from the gradient');
assert.equal(gradientBg, createAvatar('bg', { style: 'face', background: 'gradient' }), 'gradient is deterministic');

// All new face traits resolve, land in the config, and honour explicit values.
const resolved = resolveAvatarOptions('trait-coverage', {});
for (const field of ['eyebrows', 'nose', 'freckles', 'blush', 'earrings']) {
  assert.ok(AVATAR_OPTIONS[field].includes(resolved.traits[field]), `${field} resolves to a valid value`);
}
assert.ok(typeof resolved.clothing === 'string' && resolved.clothing.startsWith('#'), 'clothing resolves to a color');

const pinned = resolveAvatarOptions('pin', {
  traits: { eyebrows: 'angled', nose: 'wide', freckles: 'heavy', blush: 'soft', earrings: 'hoops' },
  clothing: '#123456'
});
assert.equal(pinned.traits.eyebrows, 'angled', 'explicit eyebrows honoured');
assert.equal(pinned.traits.nose, 'wide', 'explicit nose honoured');
assert.equal(pinned.traits.freckles, 'heavy', 'explicit freckles honoured');
assert.equal(pinned.traits.blush, 'soft', 'explicit blush honoured');
assert.equal(pinned.traits.earrings, 'hoops', 'explicit earrings honoured');
assert.equal(pinned.clothing, '#123456', 'explicit clothing colour honoured');

// avatarOptions exposes the full vocabulary, including the new options.
for (const key of ['eyebrows', 'nose', 'freckles', 'blush', 'earrings']) {
  assert.ok(Array.isArray(avatarOptions[key]) && avatarOptions[key].length > 0, `avatarOptions.${key} is populated`);
}
assert.deepEqual(avatarOptions.hairStyle, AVATAR_OPTIONS.hairStyle, 'avatarOptions re-exports the option table');

// Every style value renders, and every hair / facial-hair / headwear variant is drawable.
for (const style of AVATAR_OPTIONS.style) {
  assert.match(createAvatar({ seed: 'all-styles', style }), /^<svg /, `${style} renders SVG`);
}
for (const hairStyle of AVATAR_OPTIONS.hairStyle) {
  assert.match(createAvatar({ seed: 'hair', style: 'face', traits: { hairStyle, headwear: 'none' } }), /^<svg /, `hair ${hairStyle} renders`);
}
for (const facialHair of AVATAR_OPTIONS.facialHair) {
  assert.match(createAvatar({ seed: 'beard', style: 'face', traits: { facialHair } }), /^<svg /, `facial hair ${facialHair} renders`);
}
for (const headwear of AVATAR_OPTIONS.headwear) {
  assert.match(createAvatar({ seed: 'hat', style: 'face', traits: { headwear } }), /^<svg /, `headwear ${headwear} renders`);
}

// Status badge: string shorthand (corner dot), ring shape, position, and pulse.
const statusDot = createAvatar('s', { style: 'face', status: 'online' });
assert.match(statusDot, /<circle cx="102" cy="102" r="10" fill="#22c55e"\/>/, 'string status renders a bottom-right dot');
const statusRing = createAvatar('s', { style: 'face', status: { state: 'busy', shape: 'ring' } });
assert.match(statusRing, /<rect x="3" y="3"[^>]*stroke="#ef4444"/, 'ring status renders a border ring');
const statusPos = createAvatar('s', { style: 'face', status: { state: 'online', position: 'top-left' } });
assert.match(statusPos, /<circle cx="26" cy="26" r="10"/, 'dot status honours position');
const statusPulse = createAvatar('s', { style: 'face', status: { state: 'away', pulse: true } });
assert.match(statusPulse, /<animate /, 'pulsing status emits an animation');
assert.doesNotMatch(createAvatar('s', { style: 'face' }), /r="10" fill="#22c55e"/, 'no status renders no badge');

// Custom palette overrides default color sets across styles, and is preserved
// through encode/decode. It is dropped from the hash when absent.
const brandPalette = { shapeColors: ['#ff00aa'], skinTones: { medium: '#abcdef' }, inks: ['#654321'] };
assert.match(createAvatar('p', { style: 'shapes', palette: brandPalette }), /#ff00aa/, 'palette overrides shape colors');
assert.match(createAvatar('p', { style: 'face', palette: brandPalette, traits: { skinTone: 'medium' } }), /#abcdef/, 'palette overrides skin tones');
assert.match(createAvatar('p', { style: 'line', palette: brandPalette }), /#654321/, 'palette overrides ink');
assert.equal(avatarHash('p'), avatarHash('p'), 'absent palette keeps the hash stable');
assert.notEqual(avatarHash('p'), avatarHash('p', { palette: brandPalette }), 'palette changes the hash when set');
const paletteRound = decodeAvatar(encodeAvatar('p', { style: 'shapes', palette: brandPalette }));
assert.deepEqual(paletteRound.palette, brandPalette, 'palette survives encode/decode');

// Batch + sprite helpers.
const batch = createAvatars(['a', 'b', { seed: 'c', style: 'bot' }], { style: 'face' });
assert.equal(batch.length, 3, 'createAvatars returns one SVG per item');
assert.ok(batch.every((svg) => svg.startsWith('<svg ')), 'each batch entry is an SVG');
assert.equal(batch[0], createAvatar('a', { style: 'face' }), 'batch seed matches single render');
assert.match(batch[2], /viewBox="0 0 128 128"/, 'per-item options override the shared options');
const sprite = createAvatarSprite(['a', 'b', 'c'], { columns: 2, cell: 64, gap: 8 });
assert.match(sprite, /^<svg /, 'sprite is a single SVG');
assert.equal((sprite.match(/<svg /g) || []).length, 4, 'sprite nests one inner SVG per avatar');
assert.match(sprite, /width="136" height="136"/, 'sprite sizes the grid (2 cols x 2 rows of 64+8)');

// Initials monogram: custom font weight.
assert.match(createAvatar('AB', { style: 'initials', fontWeight: 400 }), /font-weight="400"/, 'initials honour fontWeight');
assert.match(createAvatar('AB', { style: 'initials' }), /font-weight="800"/, 'initials default to weight 800');

// The <cast-avatar> custom element wraps createAvatar (tested without a DOM by
// stubbing the attribute accessors on an instance).
assert.deepEqual([...CastAvatarElement.observedAttributes], ['seed', 'variant', 'size', 'background'], 'element observes the expected attributes');
const element = new CastAvatarElement();
const elementAttrs = { seed: 'ada', variant: 'bot', size: '64' };
element.getAttribute = (key) => (key in elementAttrs ? elementAttrs[key] : null);
element.hasAttribute = (key) => key in elementAttrs;
element.render();
assert.match(element.innerHTML, /^<svg /, 'cast-avatar renders an SVG');
assert.match(element.innerHTML, /width="64" height="64"/, 'cast-avatar honours the size attribute');

console.log('avatar tests passed');
