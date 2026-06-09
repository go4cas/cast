import { HAIR_COLORS, SKIN_TONES } from '../palettes.js';
import { svgFrame } from './common.js';

function renderEyes(eyes) {
  if (eyes === 'smile') {
    return '<path d="M42 58q6 7 12 0" fill="none" stroke="#292524" stroke-width="4" stroke-linecap="round"/><path d="M74 58q6 7 12 0" fill="none" stroke="#292524" stroke-width="4" stroke-linecap="round"/>';
  }

  if (eyes === 'sleepy') {
    return '<path d="M41 59h15" stroke="#292524" stroke-width="4" stroke-linecap="round"/><path d="M73 59h15" stroke="#292524" stroke-width="4" stroke-linecap="round"/>';
  }

  if (eyes === 'wink') {
    return '<circle cx="48" cy="58" r="4" fill="#292524"/><path d="M74 58q6 5 12 0" fill="none" stroke="#292524" stroke-width="4" stroke-linecap="round"/>';
  }

  return '<circle cx="48" cy="58" r="4" fill="#292524"/><circle cx="80" cy="58" r="4" fill="#292524"/>';
}

function renderMouth(mouth) {
  if (mouth === 'open') {
    return '<ellipse cx="64" cy="82" rx="9" ry="11" fill="#7f1d1d"/><path d="M58 86q6 5 12 0" stroke="#fecaca" stroke-width="3" stroke-linecap="round"/>';
  }

  if (mouth === 'neutral') {
    return '<path d="M54 82h20" stroke="#7f1d1d" stroke-width="4" stroke-linecap="round"/>';
  }

  return '<path d="M52 80q12 14 24 0" fill="none" stroke="#7f1d1d" stroke-width="4" stroke-linecap="round"/>';
}

function renderHair(hairStyle, hairColor) {
  const fill = HAIR_COLORS[hairColor] || HAIR_COLORS.brown;
  const attrs = `fill="${fill}"`;

  if (hairStyle === 'none' || hairStyle === 'hijab') {
    return '';
  }

  if (hairStyle === 'long') {
    return `<path d="M26 105c-5-29 0-82 38-82s43 53 38 82c-12-8-16-23-16-41H42c0 18-4 33-16 41Z" ${attrs}/>`;
  }

  if (hairStyle === 'curly' || hairStyle === 'coily') {
    const circles = [
      [35, 40, 13], [48, 31, 14], [64, 29, 15], [80, 31, 14], [93, 40, 13],
      [31, 55, 12], [97, 55, 12], [43, 50, 12], [64, 46, 13], [85, 50, 12]
    ];
    const scale = hairStyle === 'coily' ? 0.82 : 1;
    return circles.map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${Math.round(r * scale)}" ${attrs}/>`).join('');
  }

  if (hairStyle === 'bun') {
    return `<circle cx="64" cy="21" r="14" ${attrs}/><path d="M31 54c3-22 16-33 33-33s30 11 33 33c-15-12-51-12-66 0Z" ${attrs}/>`;
  }

  return `<path d="M30 57c1-23 15-36 34-36s33 13 34 36c-19-13-49-13-68 0Z" ${attrs}/>`;
}

function renderHeadwear(headwear) {
  if (headwear === 'beanie') {
    return '<path d="M31 54c1-22 15-35 33-35s32 13 33 35H31Z" fill="#334155"/><path d="M31 53h66" stroke="#64748b" stroke-width="8" stroke-linecap="round"/>';
  }

  if (headwear === 'hijab') {
    return '<path d="M27 111c-5-23-3-54 6-69 7-13 18-21 31-21s25 8 32 21c9 15 11 46 6 69H27Z" fill="#4f46e5"/>';
  }

  return '';
}

function renderAccessories(accessories) {
  if (accessories === 'glasses') {
    return '<g fill="none" stroke="#1f2937" stroke-width="3"><circle cx="48" cy="59" r="10"/><circle cx="80" cy="59" r="10"/><path d="M58 59h12"/></g>';
  }

  if (accessories === 'sunglasses') {
    return '<g fill="#111827"><rect x="36" y="50" width="24" height="17" rx="7"/><rect x="68" y="50" width="24" height="17" rx="7"/><path d="M60 58h8" stroke="#111827" stroke-width="4"/></g>';
  }

  return '';
}

function renderFacialHair(facialHair) {
  if (facialHair === 'mustache') {
    return '<path d="M51 75c6-5 10-5 13 0 3-5 7-5 13 0-7 6-18 6-26 0Z" fill="#3f2d20" opacity="0.9"/>';
  }

  if (facialHair === 'beard') {
    return '<path d="M43 80c5 21 37 21 42 0-8 16-34 16-42 0Z" fill="#3f2d20" opacity="0.9"/>';
  }

  return '';
}

function faceShapePath(faceShape, skin) {
  if (faceShape === 'oval') {
    return `<ellipse cx="64" cy="64" rx="33" ry="39" fill="${skin}"/>`;
  }

  if (faceShape === 'soft') {
    return `<rect x="31" y="29" width="66" height="72" rx="31" fill="${skin}"/>`;
  }

  return `<circle cx="64" cy="64" r="36" fill="${skin}"/>`;
}

export function renderFaceAvatar(config) {
  const skin = SKIN_TONES[config.traits.skinTone] || SKIN_TONES.medium;
  const shoulders = config.traits.gender === 'feminine' ? '#a855f7' : config.traits.gender === 'masculine' ? '#2563eb' : '#14b8a6';
  const headwear = config.traits.headwear === 'none' && config.traits.hairStyle === 'hijab' ? 'hijab' : config.traits.headwear;
  const hair = headwear === 'none' ? renderHair(config.traits.hairStyle, config.traits.hairColor) : '';
  const backLayer = headwear === 'hijab' ? renderHeadwear(headwear) : '';
  const frontLayer = headwear === 'hijab' ? '' : renderHeadwear(headwear);

  return svgFrame(config, [
    `<path d="M24 128c5-24 21-38 40-38s35 14 40 38H24Z" fill="${shoulders}"/>`,
    backLayer,
    faceShapePath(config.traits.faceShape, skin),
    hair,
    frontLayer,
    renderEyes(config.traits.eyes),
    '<path d="M64 63l-5 13h9" fill="none" stroke="#9a5b38" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>',
    renderMouth(config.traits.mouth),
    renderFacialHair(config.traits.facialHair),
    renderAccessories(config.traits.accessories)
  ].join(''));
}
