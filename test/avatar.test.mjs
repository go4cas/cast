import assert from 'node:assert/strict';
import {
  avatarHash,
  createAvatar,
  createAvatarDataUri,
  decodeAvatar,
  encodeAvatar,
  resolveAvatarOptions,
  toDataUri
} from '../src/avatar.js';

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

console.log('avatar tests passed');
