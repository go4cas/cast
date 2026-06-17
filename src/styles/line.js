import { createRandom, pick } from '../hash.js';
import { resolvePalette } from '../palettes.js';
import { svgFrame } from './common.js';

// Monochrome line-art style (shadcn-flavored): thin even strokes in a single
// seeded dark ink, no fills except small eye dots. Shares the face trait set;
// per-seed variation comes from the line features rather than color. Pairs well
// with a transparent or light background.

function renderHair(hairStyle, stroke) {
  if (hairStyle === 'none' || hairStyle === 'hijab') {
    return '';
  }

  if (hairStyle === 'long') {
    return `<path d="M36 54c0-24 13-37 28-37s28 13 28 37" ${stroke}/><path d="M37 52c-2 20-2 36 0 48" ${stroke}/><path d="M91 52c2 20 2 36 0 48" ${stroke}/>`;
  }

  if (hairStyle === 'bun') {
    return `<circle cx="64" cy="26" r="7" ${stroke}/><path d="M38 54c0-22 12-34 26-34s26 12 26 34" ${stroke}/>`;
  }

  if (hairStyle === 'afro' || hairStyle === 'curly' || hairStyle === 'coily') {
    return `<path d="M33 58q2-16 13-20q5-13 18-13q13 0 18 13q11 4 13 20" ${stroke}/>`;
  }

  return `<path d="M36 54c0-24 13-36 28-36s28 12 28 36" ${stroke}/>`;
}

function renderEyes(eyes, stroke, ink) {
  if (eyes === 'smile') {
    return `<path d="M47 61q5 -5 10 0" ${stroke}/><path d="M71 61q5 -5 10 0" ${stroke}/>`;
  }

  if (eyes === 'sleepy') {
    return `<path d="M48 60h8" ${stroke}/><path d="M72 60h8" ${stroke}/>`;
  }

  if (eyes === 'wink') {
    return `<path d="M48 60h8" ${stroke}/><circle cx="76" cy="60" r="2.2" fill="${ink}"/>`;
  }

  return `<circle cx="52" cy="60" r="2.2" fill="${ink}"/><circle cx="76" cy="60" r="2.2" fill="${ink}"/>`;
}

function renderMouth(mouth, stroke) {
  if (mouth === 'open') {
    return `<circle cx="64" cy="79" r="3.5" ${stroke}/>`;
  }

  if (mouth === 'smile') {
    return `<path d="M56 77q8 6 16 0" ${stroke}/>`;
  }

  return `<path d="M57 78h14" ${stroke}/>`;
}

function renderFacialHair(facialHair, stroke) {
  if (facialHair === 'beard' || facialHair === 'fullBeard') {
    return `<path d="M40 74c2 16 12 26 24 26s22-10 24-26" ${stroke}/>`;
  }

  if (facialHair === 'goatee') {
    return `<path d="M58 82c0 7 3 11 6 11s6-4 6-11" ${stroke}/>`;
  }

  if (facialHair === 'mustache') {
    return `<path d="M55 74q9 4 18 0" ${stroke}/>`;
  }

  return '';
}

function renderBrows(eyebrows, stroke) {
  if (eyebrows === 'raised') {
    return `<path d="M47 50q5 -3 10 0" ${stroke}/><path d="M71 50q5 -3 10 0" ${stroke}/>`;
  }
  if (eyebrows === 'angled') {
    return `<path d="M47 50l10 3" ${stroke}/><path d="M81 50l-10 3" ${stroke}/>`;
  }
  return `<path d="M47 52q5 -2 10 0" ${stroke}/><path d="M71 52q5 -2 10 0" ${stroke}/>`;
}

// Line-art hats over the crown. `turban` covers the hair (see main).
function renderHeadwear(headwear, stroke) {
  if (headwear === 'beanie') {
    return `<path d="M36 52c0-22 13-34 28-34s28 12 28 34" ${stroke}/><path d="M33 52h62" ${stroke}/>`;
  }
  if (headwear === 'cap') {
    return `<path d="M38 52c0-20 12-32 26-32s26 12 26 32" ${stroke}/><path d="M34 52q14 -5 30 -5" ${stroke}/>`;
  }
  if (headwear === 'bucket') {
    return `<path d="M44 48c0-15 9-24 20-24s20 9 20 24" ${stroke}/><path d="M33 48h62" ${stroke}/>`;
  }
  if (headwear === 'turban') {
    return `<path d="M36 54c0-20 12-34 28-34s28 14 28 34" ${stroke}/><path d="M40 44q24 -10 44 4" ${stroke}/>`;
  }
  return '';
}

function renderEarrings(earrings, stroke, ink) {
  if (earrings === 'studs') {
    return `<circle cx="36" cy="72" r="1.8" fill="${ink}"/><circle cx="92" cy="72" r="1.8" fill="${ink}"/>`;
  }
  if (earrings === 'hoops') {
    return `<circle cx="36" cy="74" r="3" ${stroke}/><circle cx="92" cy="74" r="3" ${stroke}/>`;
  }
  return '';
}

function renderAccessories(accessories, stroke, ink) {
  if (accessories === 'glasses') {
    return `<circle cx="52" cy="60" r="9" ${stroke}/><circle cx="76" cy="60" r="9" ${stroke}/><path d="M61 60h6" ${stroke}/>`;
  }

  if (accessories === 'sunglasses') {
    return `<circle cx="52" cy="60" r="9" fill="${ink}"/><circle cx="76" cy="60" r="9" fill="${ink}"/><path d="M61 60h6" ${stroke}/>`;
  }

  return '';
}

export function renderLineAvatar(config) {
  const traits = config.traits;
  const random = createRandom(`${config.seed}:line`);
  const ink = pick(resolvePalette(config.palette).inks, random);
  const stroke = `fill="none" stroke="${ink}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`;
  const isHijab = traits.headwear === 'hijab' || traits.hairStyle === 'hijab';
  // In line-art there are no fills to occlude with, so any hat replaces the hair
  // outline rather than layering over it (which would double the strokes).
  const hidesHair = isHijab || ['beanie', 'cap', 'bucket', 'turban'].includes(traits.headwear);

  const parts = [
    `<path d="M30 118c5-14 17-20 34-20s29 6 34 20" ${stroke}/>`,
    `<ellipse cx="64" cy="62" rx="30" ry="34" ${stroke}/>`
  ];

  if (isHijab) {
    parts.push(`<path d="M34 102c-4-24-2-52 6-66 6-10 14-16 24-16s18 6 24 16c8 14 10 42 6 66" ${stroke}/>`);
  } else {
    if (!hidesHair) {
      parts.push(renderHair(traits.hairStyle, stroke));
    }
    parts.push(renderHeadwear(traits.headwear, stroke));
  }

  parts.push(renderBrows(traits.eyebrows, stroke));
  parts.push(renderEyes(traits.eyes, stroke, ink));
  parts.push(`<path d="M64 60v8q-3 2 -5 1" ${stroke}/>`);
  parts.push(renderMouth(traits.mouth, stroke));
  parts.push(renderFacialHair(traits.facialHair, stroke));
  parts.push(renderAccessories(traits.accessories, stroke, ink));
  parts.push(renderEarrings(traits.earrings, stroke, ink));

  return svgFrame(config, parts.join(''));
}
