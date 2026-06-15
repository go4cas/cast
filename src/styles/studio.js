import { createRandom, hashString } from '../hash.js';
import { resolvePalette } from '../palettes.js';
import { svgFrame, eyeGroup } from './common.js';

// A softly-shaded "studio portrait" style. It reuses the proven `portrait`
// geometry but layers depth on top: a flat skin base with translucent
// vignette-shadow + upper-left highlight overlays (so any skin/hair color
// shades correctly), gradient irises with a catch-light, and shaped lips.
//
// Shading is color-agnostic: shadows are translucent black, highlights
// translucent white, composited over whatever the palette color is. All the
// tunable magic numbers live in the constants below for easy visual iteration.

const STROKE = '#5b4a42';        // soft brown line color (eyes/nose/brows)
const LIP_FILL = '#c2877d';      // lower-lip color
const LIP_LINE = '#7d4b46';      // lip seam
const IRIS_LIGHT = '#8a6a4e';    // iris center
const IRIS_DARK = '#463424';     // iris rim
const PUPIL = '#1c150f';
const FRECKLE = '#8a5a3b';
const BLUSH = '#e8918a';

// Single upper-left light source, shared by the head highlight and hair sheen.
const LIGHT_CX = 0.34;
const LIGHT_CY = 0.30;
const RIM_SHADOW = 0.24;         // head vignette darkness at the rim
const FACE_HIGHLIGHT = 0.20;     // head highlight strength

function defs(uid) {
  return '<defs>'
    + `<radialGradient id="cast-shade-${uid}" cx="0.5" cy="0.5" r="0.5">`
    + '<stop offset="0" stop-color="#000" stop-opacity="0"/>'
    + '<stop offset="0.58" stop-color="#000" stop-opacity="0"/>'
    + `<stop offset="1" stop-color="#000" stop-opacity="${RIM_SHADOW}"/>`
    + '</radialGradient>'
    + `<radialGradient id="cast-light-${uid}" cx="${LIGHT_CX}" cy="${LIGHT_CY}" r="0.55">`
    + `<stop offset="0" stop-color="#fff" stop-opacity="${FACE_HIGHLIGHT}"/>`
    + '<stop offset="1" stop-color="#fff" stop-opacity="0"/>'
    + '</radialGradient>'
    + `<radialGradient id="cast-iris-${uid}" cx="0.5" cy="0.45" r="0.55">`
    + `<stop offset="0" stop-color="${IRIS_LIGHT}"/>`
    + `<stop offset="1" stop-color="${IRIS_DARK}"/>`
    + '</radialGradient>'
    + '</defs>';
}

function renderHair(hairStyle, fill) {
  if (hairStyle === 'none' || hairStyle === 'hijab') {
    return '';
  }

  let path;
  if (hairStyle === 'long') {
    path = 'M31 104c-5-27 0-72 33-72s38 45 33 72c-7-5-9-16-9-33-6 5-13 7-24 7s-18-2-24-7c0 17-2 28-9 33Z';
  } else if (hairStyle === 'bun') {
    path = 'M35 60c0-25 13-39 29-39s29 14 29 39c-6-15-9-20-29-20s-23 5-29 20Z';
  } else if (hairStyle === 'afro' || hairStyle === 'curly' || hairStyle === 'coily') {
    path = 'M28 66c-3-31 16-48 36-48s39 17 36 48c-8-19-21-26-36-26s-28 7-36 26Z';
  } else {
    path = 'M35 62c0-25 13-40 29-40s29 15 29 40c-6-15-9-21-29-21s-23 6-29 21Z';
  }

  const bun = hairStyle === 'bun' ? `<circle cx="64" cy="25" r="10" fill="${fill}"/>` : '';
  // base hair + a single generic crown sheen (upper-left light source).
  return `${bun}<path d="${path}" fill="${fill}"/>`
    + '<path d="M46 36q18 -13 36 0" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.13"/>';
}

function renderEye(cx, eyes, uid) {
  if (eyes === 'wink' && cx < 64) {
    return `<path d="M${cx - 7} 64q7 4 14 0" fill="none" stroke="${STROKE}" stroke-width="2" stroke-linecap="round"/>`;
  }

  if (eyes === 'sleepy') {
    return `<path d="M${cx - 7} 64q7 -3 14 0" fill="none" stroke="${STROKE}" stroke-width="2" stroke-linecap="round"/>`
      + `<circle cx="${cx}" cy="64" r="2.2" fill="${STROKE}"/>`;
  }

  if (eyes === 'smile') {
    return `<path d="M${cx - 7} 65q7 -6 14 0" fill="none" stroke="${STROKE}" stroke-width="2" stroke-linecap="round"/>`;
  }

  // round: sclera + gradient iris + pupil + catch-light + lid line + socket shadow
  return `<path d="M${cx - 7} 64q7 -6 14 0q-7 5 -14 0Z" fill="#fbfbfa"/>`
    + `<circle cx="${cx}" cy="64" r="3.5" fill="url(#cast-iris-${uid})"/>`
    + `<circle cx="${cx}" cy="64" r="1.8" fill="${PUPIL}"/>`
    + `<circle cx="${cx - 1.3}" cy="62.7" r="0.9" fill="#fff" opacity="0.9"/>`
    + `<path d="M${cx - 7} 64q7 -6 14 0" fill="none" stroke="${STROKE}" stroke-width="1.6" stroke-linecap="round"/>`
    + `<path d="M${cx - 7} 62q7 -5 14 0" fill="none" stroke="#000" stroke-width="1.6" stroke-linecap="round" opacity="0.08"/>`;
}

function renderMouth(mouth) {
  if (mouth === 'open') {
    return '<ellipse cx="64" cy="85" rx="5" ry="3.6" fill="#7a3b39"/>'
      + '<path d="M58 89q6 3 12 0" fill="none" stroke="#a8635a" stroke-width="2" stroke-linecap="round"/>'
      + '<path d="M60 90q4 2 8 0" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity="0.16"/>';
  }

  const seam = mouth === 'smile' ? 'M55 85q9 6 18 0' : 'M57 86q7 3 14 0';
  const lower = mouth === 'smile' ? 'M55 85q9 6 18 0q-9 4 -18 0Z' : 'M57 86q7 3 14 0q-7 3 -14 0Z';
  return `<path d="${lower}" fill="${LIP_FILL}"/>`
    + `<path d="${seam}" fill="none" stroke="${LIP_LINE}" stroke-width="1.6" stroke-linecap="round"/>`
    + '<path d="M60 88q4 2 8 0" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity="0.18"/>';
}

function renderNose() {
  return `<path d="M63 65q-3 9 -1 12q2 2 6 1" fill="none" stroke="${STROKE}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.45"/>`
    + '<ellipse cx="64" cy="77" rx="4.5" ry="2" fill="#000" opacity="0.10"/>'
    + '<path d="M64 60v14" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity="0.12"/>';
}

function renderFacialHair(facialHair, fill) {
  if (facialHair === 'beard' || facialHair === 'fullBeard') {
    return `<path d="M39 80c4 17 13 26 25 26s21-9 25-26c-6 11-12 16-25 16s-19-5-25-16Z" fill="${fill}" opacity="0.9"/>`;
  }

  if (facialHair === 'goatee') {
    return `<path d="M57 88c0 8 3 13 7 13s7-5 7-13c-4 3-10 3-14 0Z" fill="${fill}" opacity="0.9"/>`;
  }

  if (facialHair === 'mustache') {
    return `<path d="M55 82q9 -4 18 0" fill="none" stroke="${fill}" stroke-width="3" stroke-linecap="round" opacity="0.9"/>`;
  }

  if (facialHair === 'stubble' || facialHair === 'sideburns') {
    return `<path d="M39 80c4 17 13 26 25 26s21-9 25-26c-6 11-12 16-25 16s-19-5-25-16Z" fill="${fill}" opacity="0.22"/>`;
  }

  return '';
}

function renderAccessories(accessories) {
  if (accessories === 'glasses') {
    return '<g fill="none" stroke="#3a3a3a" stroke-width="1.6"><rect x="44" y="58" width="16" height="12" rx="5"/><rect x="68" y="58" width="16" height="12" rx="5"/><path d="M60 63h8"/><path d="M44 62l-8-2"/><path d="M84 62l6-2"/></g>'
      + '<g fill="#fff" opacity="0.12"><rect x="44" y="58" width="16" height="12" rx="5"/><rect x="68" y="58" width="16" height="12" rx="5"/></g>';
  }

  if (accessories === 'sunglasses') {
    return '<g fill="#26262b"><rect x="43" y="57" width="18" height="13" rx="5"/><rect x="67" y="57" width="18" height="13" rx="5"/></g>'
      + '<path d="M61 62h6" stroke="#26262b" stroke-width="3"/>'
      + '<path d="M46 60l8 0" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.18"/>';
  }

  return '';
}

function renderFreckles(freckles, seed) {
  if (freckles !== 'light' && freckles !== 'heavy') {
    return '';
  }

  const random = createRandom(`${seed}:studiofreckles`);
  const count = freckles === 'heavy' ? 16 : 9;
  let dots = '';
  for (let i = 0; i < count; i += 1) {
    const side = random() < 0.5 ? 50 : 78;
    const x = Math.round(side + (random() * 12 - 6));
    const y = Math.round(70 + random() * 8);
    dots += `<circle cx="${x}" cy="${y}" r="0.9" fill="${FRECKLE}" opacity="0.5"/>`;
  }
  return dots;
}

export function renderStudioAvatar(config) {
  const traits = config.traits;
  const palette = resolvePalette(config.palette);
  const skin = palette.skinTones[traits.skinTone] || palette.skinTones.medium;
  const hairFill = palette.hairColors[traits.hairColor] || palette.hairColors.brown;
  const browColor = palette.hairColors[traits.hairColor] || STROKE;
  const clothing = traits.clothing || config.clothing || '#64748b';
  const isHijab = traits.headwear === 'hijab' || traits.hairStyle === 'hijab';
  const shoulderSpread = traits.gender === 'masculine' ? 40 : traits.gender === 'feminine' ? 34 : 37;
  const uid = hashString(`${config.seed}:studio`).toString(36);

  const faceRx = isHijab ? 22 : 29;
  const faceRy = isHijab ? 27 : 36;

  const parts = [
    defs(uid),
    `<path d="M${64 - shoulderSpread} 128c3-19 17-30 ${shoulderSpread} -30s${shoulderSpread - 2} 11 ${shoulderSpread} 30Z" fill="${clothing}"/>`,
    `<path d="M${64 - shoulderSpread + 6} 128c2-12 12-20 ${shoulderSpread - 6} -20" fill="none" stroke="#000" stroke-width="6" stroke-linecap="round" opacity="0.10"/>`,
    `<rect x="57" y="94" width="14" height="15" rx="5" fill="${skin}"/>`,
    `<path d="M50 96q14 9 28 0" fill="none" stroke="#000" stroke-width="4" stroke-linecap="round" opacity="0.14"/>`,
    `<ellipse cx="36" cy="68" rx="4" ry="7" fill="${skin}"/>`,
    `<ellipse cx="92" cy="68" rx="4" ry="7" fill="${skin}"/>`
  ];

  if (isHijab) {
    parts.push(`<path d="M30 112c-5-27-2-60 7-77 7-12 16-18 27-18s20 6 27 18c9 17 12 50 7 77Z" fill="${clothing}"/>`);
  }

  // shaded face: flat skin, then a rim-shadow vignette and an upper-left highlight.
  parts.push(`<ellipse cx="64" cy="66" rx="${faceRx}" ry="${faceRy}" fill="${skin}"/>`);
  parts.push(`<ellipse cx="64" cy="66" rx="${faceRx}" ry="${faceRy}" fill="url(#cast-shade-${uid})"/>`);
  parts.push(`<ellipse cx="64" cy="66" rx="${faceRx}" ry="${faceRy}" fill="url(#cast-light-${uid})"/>`);

  if (!isHijab) {
    parts.push(renderHair(traits.hairStyle, hairFill));
  }

  // brows
  parts.push(`<path d="M46 56q6 -3 13 -1" fill="none" stroke="${browColor}" stroke-width="2" stroke-linecap="round"/>`);
  parts.push(`<path d="M82 56q-6 -3 -13 -1" fill="none" stroke="${browColor}" stroke-width="2" stroke-linecap="round"/>`);

  // cheeks (blush), eyes, nose, mouth
  if (traits.blush === 'soft') {
    parts.push(`<ellipse cx="50" cy="74" rx="6" ry="4" fill="${BLUSH}" opacity="0.18"/>`);
    parts.push(`<ellipse cx="78" cy="74" rx="6" ry="4" fill="${BLUSH}" opacity="0.18"/>`);
  }
  parts.push(renderFreckles(traits.freckles, config.seed));
  parts.push(eyeGroup(config, renderEye(52, traits.eyes, uid) + renderEye(76, traits.eyes, uid)));
  parts.push(renderNose());
  parts.push(renderMouth(traits.mouth));
  parts.push(renderFacialHair(traits.facialHair, hairFill));
  parts.push(renderAccessories(traits.accessories));

  return svgFrame(config, parts.join(''));
}
