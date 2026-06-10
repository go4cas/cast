import { createRandom, pick } from '../hash.js';
import { svgFrame } from './common.js';

// Monochrome line-art style (shadcn-flavored): thin even strokes in a single
// seeded dark ink, no fills except small eye dots. Shares the face trait set;
// per-seed variation comes from the line features rather than color. Pairs well
// with a transparent or light background.
const INKS = ['#18181b', '#1e293b', '#3f3f46', '#292524', '#1f2937', '#374151'];

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
  const ink = pick(INKS, random);
  const stroke = `fill="none" stroke="${ink}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"`;
  const isHijab = traits.headwear === 'hijab' || traits.hairStyle === 'hijab';

  const parts = [
    `<path d="M30 118c5-14 17-20 34-20s29 6 34 20" ${stroke}/>`,
    `<ellipse cx="64" cy="62" rx="30" ry="34" ${stroke}/>`
  ];

  if (isHijab) {
    parts.push(`<path d="M34 102c-4-24-2-52 6-66 6-10 14-16 24-16s18 6 24 16c8 14 10 42 6 66" ${stroke}/>`);
  } else {
    parts.push(renderHair(traits.hairStyle, stroke));
  }

  parts.push(`<path d="M47 52q5 -2 10 0" ${stroke}/>`);
  parts.push(`<path d="M71 52q5 -2 10 0" ${stroke}/>`);
  parts.push(renderEyes(traits.eyes, stroke, ink));
  parts.push(`<path d="M64 60v8q-3 2 -5 1" ${stroke}/>`);
  parts.push(renderMouth(traits.mouth, stroke));
  parts.push(renderFacialHair(traits.facialHair, stroke));
  parts.push(renderAccessories(traits.accessories, stroke, ink));

  return svgFrame(config, parts.join(''));
}
