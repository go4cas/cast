import { createRandom, hashString } from '../hash.js';
import { resolvePalette } from '../palettes.js';
import { svgFrame, eyeGroup, mouthGroup } from './common.js';

// A semi-realistic, sculpted "studio portrait". It shares the face trait set and
// feature layout with `portrait` (so a given seed reads as the same person), but
// pushes fidelity much further: a faceShape-driven head silhouette, multi-layer
// color-agnostic skin modelling (vertical light, upper-left key light, rim-shadow
// vignette, cheekbone highlights, jaw/temple core shadows), a sculpted nose,
// volumetric upper/lower lips, almond lidded eyes with a gradient iris and
// catch-light, and hair with a gradient sheen.
//
// All shading is color-agnostic: shadows are translucent black, highlights
// translucent white, composited over whatever palette color sits underneath, so
// every skin/hair color shades correctly. Tunable magic numbers live in the
// constants below for easy visual iteration.

const STROKE = '#5b4a42';       // soft brown line color (nose/brows)
const LASH = '#2b211c';         // upper-lid lash line
const LIP_FILL = '#c2877d';     // lower-lip color
const LIP_DARK = '#a86b62';     // upper-lip color (in shadow)
const LIP_LINE = '#7d4b46';     // lip seam
const TEETH = '#fbf6f0';
const IRIS_LIGHT = '#9a7350';   // iris center
const IRIS_MID = '#6d4d33';
const IRIS_DARK = '#3a2a1c';    // iris rim
const PUPIL = '#1a1209';
const FRECKLE = '#8a5a3b';
const BLUSH = '#e8918a';
const METAL = '#e9d8a6';        // earrings

// Single upper-left light source, shared by the key light and hair sheen.
const KEY_CX = 0.34;
const KEY_CY = 0.28;
const KEY_LIGHT = 0.22;         // upper-left highlight strength
const RIM_SHADOW = 0.26;        // face vignette darkness at the rim

// Head silhouettes per faceShape. Feature coordinates (eyes/nose/mouth/ears)
// are intentionally shared across all three so the same seed stays recognizable
// when only the face outline changes.
const FACE = {
  oval: 'M64 30C81 30 92 44 91 64C90 82 80 98 64 104C48 98 38 82 37 64C36 44 47 30 64 30Z',
  round: 'M64 32C83 32 95 46 95 65C95 80 82 99 64 101C46 99 33 80 33 65C33 46 45 32 64 32Z',
  soft: 'M64 31C82 31 93 45 93 64C93 81 81 100 64 103C47 100 35 81 35 64C35 45 46 31 64 31Z'
};

function defs(uid) {
  return '<defs>'
    // vertical skin modelling: lit forehead → neutral mid → shadowed jaw.
    + `<linearGradient id="cast-st-skin-${uid}" x1="0" y1="0" x2="0" y2="1">`
    + '<stop offset="0" stop-color="#fff" stop-opacity="0.16"/>'
    + '<stop offset="0.42" stop-color="#fff" stop-opacity="0"/>'
    + '<stop offset="1" stop-color="#000" stop-opacity="0.18"/>'
    + '</linearGradient>'
    // upper-left key light.
    + `<radialGradient id="cast-st-key-${uid}" cx="${KEY_CX}" cy="${KEY_CY}" r="0.62">`
    + `<stop offset="0" stop-color="#fff" stop-opacity="${KEY_LIGHT}"/>`
    + '<stop offset="1" stop-color="#fff" stop-opacity="0"/>'
    + '</radialGradient>'
    // rim-shadow vignette to round the cheeks off.
    + `<radialGradient id="cast-st-rim-${uid}" cx="0.5" cy="0.5" r="0.5">`
    + '<stop offset="0" stop-color="#000" stop-opacity="0"/>'
    + '<stop offset="0.62" stop-color="#000" stop-opacity="0"/>'
    + `<stop offset="1" stop-color="#000" stop-opacity="${RIM_SHADOW}"/>`
    + '</radialGradient>'
    // gradient iris.
    + `<radialGradient id="cast-st-iris-${uid}" cx="0.5" cy="0.42" r="0.6">`
    + `<stop offset="0" stop-color="${IRIS_LIGHT}"/>`
    + `<stop offset="0.6" stop-color="${IRIS_MID}"/>`
    + `<stop offset="1" stop-color="${IRIS_DARK}"/>`
    + '</radialGradient>'
    // hair volume: crown sheen → neutral → root shadow.
    + `<linearGradient id="cast-st-hair-${uid}" x1="0.2" y1="0" x2="0.4" y2="1">`
    + '<stop offset="0" stop-color="#fff" stop-opacity="0.22"/>'
    + '<stop offset="0.4" stop-color="#fff" stop-opacity="0"/>'
    + '<stop offset="1" stop-color="#000" stop-opacity="0.22"/>'
    + '</linearGradient>'
    + '</defs>';
}

function renderHair(hairStyle, fill, uid) {
  if (hairStyle === 'none' || hairStyle === 'hijab') {
    return '';
  }

  let path;
  let bun = '';
  if (hairStyle === 'long') {
    path = 'M31 104c-5-27 0-72 33-72s38 45 33 72c-7-5-9-16-9-33-6 5-13 7-24 7s-18-2-24-7c0 17-2 28-9 33Z';
  } else if (hairStyle === 'bun') {
    path = 'M35 60c0-25 13-39 29-39s29 14 29 39c-6-15-9-20-29-20s-23 5-29 20Z';
    bun = `<circle cx="64" cy="24" r="10" fill="${fill}"/>`
      + `<circle cx="64" cy="24" r="10" fill="url(#cast-st-hair-${uid})"/>`;
  } else if (hairStyle === 'afro' || hairStyle === 'curly' || hairStyle === 'coily') {
    path = 'M28 66c-3-31 16-48 36-48s39 17 36 48c-8-19-21-26-36-26s-28 7-36 26Z';
  } else if (hairStyle === 'mohawk') {
    path = 'M57 22q7-8 14 0c2 14 1 30-7 40c-8-10-9-26-7-40Z';
  } else if (hairStyle === 'spiky') {
    path = 'M35 60 42 34 48 52 56 30 64 50 72 30 80 52 86 34 93 60Q64 50 35 60Z';
  } else {
    // short / stubble / textured collapse to a smooth, close cap.
    path = 'M35 62c0-25 13-40 29-40s29 15 29 40c-6-15-9-21-29-21s-23 6-29 21Z';
  }

  // base hair, a gradient sheen overlay for volume, then a crown strand light.
  return `${bun}<path d="${path}" fill="${fill}"/>`
    + `<path d="${path}" fill="url(#cast-st-hair-${uid})"/>`
    + '<path d="M46 34q18-12 36 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.16"/>';
}

// Hats drawn on top of any hair. `turban` fully hides the hair (see main).
function renderHeadwear(headwear, clothing, uid) {
  if (headwear === 'beanie') {
    const cap = 'M33 53c0-22 14-35 31-35s31 13 31 35c-10-8-21-12-31-12s-21 4-31 12Z';
    return `<path d="${cap}" fill="${clothing}"/>`
      + `<path d="${cap}" fill="url(#cast-st-hair-${uid})"/>`
      + `<rect x="32" y="49" width="64" height="8" rx="4" fill="${clothing}"/>`
      + '<rect x="32" y="49" width="64" height="8" rx="4" fill="#000" opacity="0.10"/>';
  }

  if (headwear === 'cap') {
    const dome = 'M34 55c0-21 14-33 30-33s30 12 30 33c-10-7-20-10-30-10s-20 3-30 10Z';
    return `<path d="${dome}" fill="${clothing}"/>`
      + `<path d="${dome}" fill="url(#cast-st-hair-${uid})"/>`
      + `<path d="M30 54q34-7 68 0q-3 6 -12 7 q-22 3 -44 0 q-9 -1 -12 -7Z" fill="${clothing}"/>`
      + '<path d="M30 54q34-7 68 0" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" opacity="0.12"/>';
  }

  if (headwear === 'bucket') {
    const dome = 'M37 51c0-18 12-29 27-29s27 11 27 29Z';
    return `<path d="${dome}" fill="${clothing}"/>`
      + `<path d="${dome}" fill="url(#cast-st-hair-${uid})"/>`
      + `<path d="M27 51q37 11 74 0q-4 9 -17 12 q-20 4 -40 0 q-13 -3 -17 -12Z" fill="${clothing}"/>`
      + '<path d="M27 51q37 11 74 0" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" opacity="0.10"/>';
  }

  if (headwear === 'turban') {
    const wrap = 'M30 56c-2-25 13-41 34-41s36 16 34 41c-6-11-10-31-34-31s-28 20-34 31Z';
    return `<path d="${wrap}" fill="${clothing}"/>`
      + `<path d="${wrap}" fill="url(#cast-st-hair-${uid})"/>`
      + '<path d="M32 52q14-22 32-15" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" opacity="0.12"/>'
      + '<path d="M40 40q20-12 40 6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.12"/>';
  }

  return '';
}

function renderBrows(eyebrows, color) {
  let left;
  let right;
  if (eyebrows === 'raised') {
    left = 'M45 55q7-4.5 14-1';
    right = 'M83 55q-7-4.5 -14 -1';
  } else if (eyebrows === 'angled') {
    left = 'M45 54q7 1 14 4';
    right = 'M83 54q-7 1 -14 4';
  } else {
    left = 'M45 56q7-2.5 14 0';
    right = 'M83 56q-7-2.5 -14 0';
  }
  return `<path d="${left}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round"/>`
    + `<path d="${right}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round"/>`;
}

function renderEye(cx, eyes, uid) {
  if (eyes === 'wink' && cx < 64) {
    return `<path d="M${cx - 7} 64q7 4 14 0" fill="none" stroke="${LASH}" stroke-width="2.2" stroke-linecap="round"/>`;
  }

  if (eyes === 'sleepy') {
    return `<path d="M${cx - 8} 62q8-5 16 1" fill="none" stroke="#000" stroke-width="1.4" stroke-linecap="round" opacity="0.10"/>`
      + `<path d="M${cx - 7} 64q7-2 14 0" fill="none" stroke="${LASH}" stroke-width="2.2" stroke-linecap="round"/>`
      + `<circle cx="${cx}" cy="64.5" r="2.1" fill="${IRIS_DARK}"/>`;
  }

  if (eyes === 'smile') {
    return `<path d="M${cx - 7} 65q7-6 14 0" fill="none" stroke="${LASH}" stroke-width="2.2" stroke-linecap="round"/>`;
  }

  // round (default): crease, almond sclera, gradient iris, pupil, catch-light,
  // lash line, soft lower lid.
  return `<path d="M${cx - 8} 61.5q8-6 16 1" fill="none" stroke="#000" stroke-width="1.6" stroke-linecap="round" opacity="0.12"/>`
    + `<path d="M${cx - 7} 64q7-5.5 14 0q-7 5.5 -14 0Z" fill="#fbfaf8"/>`
    + `<circle cx="${cx}" cy="64" r="3.4" fill="url(#cast-st-iris-${uid})"/>`
    + `<circle cx="${cx}" cy="64" r="1.7" fill="${PUPIL}"/>`
    + `<circle cx="${cx - 1.2}" cy="62.7" r="0.9" fill="#fff" opacity="0.92"/>`
    + `<path d="M${cx - 7} 64q7-5.5 14 0" fill="none" stroke="${LASH}" stroke-width="1.8" stroke-linecap="round"/>`
    + `<path d="M${cx - 6} 65.6q6 2.4 12 0" fill="none" stroke="#000" stroke-width="1" stroke-linecap="round" opacity="0.12"/>`;
}

function renderNose(nose) {
  if (nose === 'button') {
    return '<path d="M64 60v13" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity="0.14"/>'
      + '<ellipse cx="64" cy="75" rx="4" ry="2" fill="#000" opacity="0.12"/>'
      + '<path d="M61 75q-1.5 1.5 -0.5 2.6" fill="none" stroke="#000" stroke-width="1.2" stroke-linecap="round" opacity="0.18"/>'
      + '<path d="M67 75q1.5 1.5 0.5 2.6" fill="none" stroke="#000" stroke-width="1.2" stroke-linecap="round" opacity="0.18"/>';
  }

  if (nose === 'wide') {
    return '<path d="M64 59v15" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity="0.14"/>'
      + '<path d="M68 60q4 9 1 15" fill="none" stroke="#000" stroke-width="1.6" stroke-linecap="round" opacity="0.12"/>'
      + '<ellipse cx="64" cy="77" rx="6.5" ry="2.6" fill="#000" opacity="0.12"/>'
      + '<ellipse cx="59" cy="77.5" rx="1.8" ry="1.3" fill="#000" opacity="0.22"/>'
      + '<ellipse cx="69" cy="77.5" rx="1.8" ry="1.3" fill="#000" opacity="0.22"/>';
  }

  // soft (default): bridge highlight, one-sided bridge shadow, tip shadow, nostrils.
  return '<path d="M64 59v15" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity="0.14"/>'
    + '<path d="M67 60q3 9 1 15" fill="none" stroke="#000" stroke-width="1.6" stroke-linecap="round" opacity="0.12"/>'
    + '<path d="M63 65q-3 9 -1 12q2 2 6 1" fill="none" stroke="' + STROKE + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/>'
    + '<ellipse cx="64" cy="76.5" rx="5" ry="2.2" fill="#000" opacity="0.12"/>'
    + '<ellipse cx="60.5" cy="76.8" rx="1.4" ry="1.1" fill="#000" opacity="0.2"/>'
    + '<ellipse cx="67.5" cy="76.8" rx="1.4" ry="1.1" fill="#000" opacity="0.2"/>';
}

function renderMouth(mouth) {
  if (mouth === 'open') {
    return '<ellipse cx="64" cy="86" rx="5.5" ry="4" fill="#7a3b39"/>'
      + '<path d="M59 83.5q5 2 10 0v2q-5 1.4 -10 0Z" fill="' + TEETH + '"/>'
      + '<path d="M57 84q7-2.5 14 0q-7 3 -14 0Z" fill="' + LIP_DARK + '"/>'
      + '<path d="M57.5 89q6.5 3.5 13 0q-6.5 3.5 -13 0Z" fill="' + LIP_FILL + '"/>'
      + '<path d="M60 91q4 1.5 8 0" fill="none" stroke="#fff" stroke-width="1.1" stroke-linecap="round" opacity="0.18"/>';
  }

  if (mouth === 'smile') {
    return '<path d="M54 84q10 5 20 0q-10 1.5 -20 0Z" fill="' + TEETH + '"/>'
      + '<path d="M54 84q4-2.5 10-1q6-1.5 10 1q-10 3 -20 0Z" fill="' + LIP_DARK + '"/>'
      + '<path d="M54 84q10 6 20 0q-10 4 -20 0Z" fill="' + LIP_FILL + '"/>'
      + '<path d="M54 84q10 5 20 0" fill="none" stroke="' + LIP_LINE + '" stroke-width="1.4" stroke-linecap="round"/>'
      + '<path d="M59 88q5 2 10 0" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity="0.2"/>';
  }

  // neutral: cupid's-bow upper lip + fuller lower lip + seam + highlight.
  return '<path d="M56 84q4-2.5 8-1q4-1.5 8 1q-8 2.5 -16 0Z" fill="' + LIP_DARK + '"/>'
    + '<path d="M56 84q8 4.5 16 0q-8 2.5 -16 0Z" fill="' + LIP_FILL + '"/>'
    + '<path d="M56 84q8 2.5 16 0" fill="none" stroke="' + LIP_LINE + '" stroke-width="1.4" stroke-linecap="round"/>'
    + '<path d="M60 87.5q4 1.5 8 0" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity="0.2"/>';
}

function renderFacialHair(facialHair, fill) {
  if (facialHair === 'beard' || facialHair === 'fullBeard') {
    return `<path d="M39 80c4 17 13 26 25 26s21-9 25-26c-6 11-12 16-25 16s-19-5-25-16Z" fill="${fill}"/>`
      + '<path d="M39 80c4 17 13 26 25 26s21-9 25-26c-6 11-12 16-25 16s-19-5-25-16Z" fill="#000" opacity="0.12"/>';
  }

  if (facialHair === 'goatee') {
    return `<path d="M57 88c0 8 3 13 7 13s7-5 7-13c-4 3-10 3-14 0Z" fill="${fill}"/>`;
  }

  if (facialHair === 'mustache') {
    return `<path d="M55 82q9-4 18 0q-3 4 -9 4q-6 0 -9 -4Z" fill="${fill}"/>`;
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
      + '<path d="M46 60l8 0" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.2"/>';
  }

  return '';
}

function renderEarrings(earrings) {
  if (earrings === 'studs') {
    return `<circle cx="37" cy="76" r="1.9" fill="${METAL}"/><circle cx="91" cy="76" r="1.9" fill="${METAL}"/>`;
  }
  if (earrings === 'hoops') {
    return `<ellipse cx="37" cy="78" rx="2.6" ry="3.6" fill="none" stroke="${METAL}" stroke-width="1.6"/>`
      + `<ellipse cx="91" cy="78" rx="2.6" ry="3.6" fill="none" stroke="${METAL}" stroke-width="1.6"/>`;
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
  const hidesHair = isHijab || traits.headwear === 'turban';
  const shoulderSpread = traits.gender === 'masculine' ? 40 : traits.gender === 'feminine' ? 34 : 37;
  const uid = hashString(`${config.seed}:studio`).toString(36);
  const facePath = FACE[traits.faceShape] || FACE.soft;

  const parts = [
    defs(uid),
    // shoulders + collar shadow
    `<path d="M${64 - shoulderSpread} 128c3-19 17-30 ${shoulderSpread} -30s${shoulderSpread - 2} 11 ${shoulderSpread} 30Z" fill="${clothing}"/>`,
    `<path d="M${64 - shoulderSpread + 6} 128c2-12 12-20 ${shoulderSpread - 6} -20" fill="none" stroke="#000" stroke-width="6" stroke-linecap="round" opacity="0.1"/>`,
    // neck + chin-cast shadow
    `<rect x="57" y="94" width="14" height="15" rx="5" fill="${skin}"/>`,
    `<path d="M50 96q14 9 28 0" fill="none" stroke="#000" stroke-width="4" stroke-linecap="round" opacity="0.16"/>`,
    // ears + inner shadow
    `<ellipse cx="36" cy="68" rx="4.5" ry="7.5" fill="${skin}"/>`,
    `<ellipse cx="92" cy="68" rx="4.5" ry="7.5" fill="${skin}"/>`,
    `<path d="M35 64q3 5 0 9" fill="none" stroke="#000" stroke-width="1.4" stroke-linecap="round" opacity="0.14"/>`,
    `<path d="M93 64q-3 5 0 9" fill="none" stroke="#000" stroke-width="1.4" stroke-linecap="round" opacity="0.14"/>`
  ];

  if (isHijab) {
    // a head wrap behind a smaller exposed face oval.
    parts.push(`<path d="M30 112c-5-27-2-60 7-77 7-12 16-18 27-18s20 6 27 18c9 17 12 50 7 77Z" fill="${clothing}"/>`);
    parts.push('<path d="M30 112c-5-27-2-60 7-77 7-12 16-18 27-18" fill="none" stroke="#000" stroke-width="5" stroke-linecap="round" opacity="0.08"/>');
    parts.push(`<ellipse cx="64" cy="68" rx="22" ry="28" fill="${skin}"/>`);
    parts.push(`<ellipse cx="64" cy="68" rx="22" ry="28" fill="url(#cast-st-key-${uid})"/>`);
    parts.push(`<ellipse cx="64" cy="68" rx="22" ry="28" fill="url(#cast-st-rim-${uid})"/>`);
  } else {
    // sculpted face: flat skin, vertical light, key light, rim vignette, then
    // cheekbone highlights and jaw/temple core shadows.
    parts.push(`<path d="${facePath}" fill="${skin}"/>`);
    parts.push(`<path d="${facePath}" fill="url(#cast-st-skin-${uid})"/>`);
    parts.push(`<path d="${facePath}" fill="url(#cast-st-key-${uid})"/>`);
    parts.push(`<path d="${facePath}" fill="url(#cast-st-rim-${uid})"/>`);
    parts.push(`<ellipse cx="49" cy="71" rx="9" ry="6" fill="#fff" opacity="0.07" transform="rotate(-18 49 71)"/>`);
    parts.push(`<ellipse cx="79" cy="71" rx="9" ry="6" fill="#fff" opacity="0.055" transform="rotate(18 79 71)"/>`);
    parts.push(`<ellipse cx="64" cy="96" rx="14" ry="6" fill="#000" opacity="0.08"/>`);
    parts.push(`<ellipse cx="40" cy="60" rx="4.5" ry="9" fill="#000" opacity="0.07"/>`);
    parts.push(`<ellipse cx="88" cy="60" rx="4.5" ry="9" fill="#000" opacity="0.07"/>`);

    if (!hidesHair) {
      parts.push(renderHair(traits.hairStyle, hairFill, uid));
    }
    parts.push(renderHeadwear(traits.headwear, clothing, uid));
  }

  parts.push(renderBrows(traits.eyebrows, browColor));

  if (traits.blush === 'soft') {
    parts.push(`<ellipse cx="49" cy="75" rx="6" ry="4" fill="${BLUSH}" opacity="0.18"/>`);
    parts.push(`<ellipse cx="79" cy="75" rx="6" ry="4" fill="${BLUSH}" opacity="0.18"/>`);
  }
  parts.push(renderFreckles(traits.freckles, config.seed));
  parts.push(eyeGroup(config, renderEye(52, traits.eyes, uid) + renderEye(76, traits.eyes, uid)));
  parts.push(renderNose(traits.nose));
  parts.push(mouthGroup(config, renderMouth(traits.mouth)));
  parts.push(renderFacialHair(traits.facialHair, hairFill));
  parts.push(renderAccessories(traits.accessories));
  parts.push(renderEarrings(traits.earrings));

  return svgFrame(config, parts.join(''));
}
