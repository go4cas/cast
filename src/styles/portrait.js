import { createRandom } from '../hash.js';
import { resolvePalette } from '../palettes.js';
import { svgFrame, eyeGroup } from './common.js';

// A refined, less-cartoony illustrative portrait. Shares the face trait set but
// renders grown-up proportions: an oval head, almond lidded eyes, thin brows, a
// subtle nose, a calm muted mouth, and smooth (non-bubbly) hair.

const SHADOW = '#5b4a42';
const METAL = '#e9d8a6';        // earrings

// faceShape silhouettes — the soft illustrative head is an ellipse whose
// proportions shift per faceShape (oval = long/narrow, round = wide/short).
const FACE_DIMS = {
  oval: { rx: 27, ry: 38 },
  round: { rx: 31, ry: 34 },
  soft: { rx: 29, ry: 36 }
};

function renderHair(hairStyle, fill) {
  if (hairStyle === 'none' || hairStyle === 'hijab') {
    return '';
  }

  if (hairStyle === 'long') {
    return `<path d="M31 104c-5-27 0-72 33-72s38 45 33 72c-7-5-9-16-9-33-6 5-13 7-24 7s-18-2-24-7c0 17-2 28-9 33Z" fill="${fill}"/>`;
  }

  if (hairStyle === 'bun') {
    return `<circle cx="64" cy="25" r="10" fill="${fill}"/><path d="M35 60c0-25 13-39 29-39s29 14 29 39c-6-15-9-20-29-20s-23 5-29 20Z" fill="${fill}"/>`;
  }

  if (hairStyle === 'afro' || hairStyle === 'curly' || hairStyle === 'coily') {
    return `<path d="M28 66c-3-31 16-48 36-48s39 17 36 48c-8-19-21-26-36-26s-28 7-36 26Z" fill="${fill}"/>`;
  }

  if (hairStyle === 'mohawk') {
    return `<path d="M57 22q7-8 14 0c2 14 1 30-7 40c-8-10-9-26-7-40Z" fill="${fill}"/>`;
  }

  if (hairStyle === 'spiky') {
    return `<path d="M35 60 42 34 48 52 56 30 64 50 72 30 80 52 86 34 93 60Q64 50 35 60Z" fill="${fill}"/>`;
  }

  // short / stubble / textured styles collapse to a smooth, close cap.
  return `<path d="M35 62c0-25 13-40 29-40s29 15 29 40c-6-15-9-21-29-21s-23 6-29 21Z" fill="${fill}"/>`;
}

function renderEye(cx, eyes) {
  if (eyes === 'wink' && cx < 64) {
    return `<path d="M${cx - 7} 64q7 4 14 0" fill="none" stroke="${SHADOW}" stroke-width="2" stroke-linecap="round"/>`;
  }

  if (eyes === 'sleepy') {
    return `<path d="M${cx - 7} 64q7 -3 14 0" fill="none" stroke="${SHADOW}" stroke-width="2" stroke-linecap="round"/>`
      + `<circle cx="${cx}" cy="64" r="2.2" fill="${SHADOW}"/>`;
  }

  if (eyes === 'smile') {
    return `<path d="M${cx - 7} 65q7 -6 14 0" fill="none" stroke="${SHADOW}" stroke-width="2" stroke-linecap="round"/>`;
  }

  return `<path d="M${cx - 7} 64q7 -6 14 0q-7 5 -14 0Z" fill="#fbfbfa"/>`
    + `<circle cx="${cx}" cy="64" r="2.6" fill="#46362f"/>`
    + `<path d="M${cx - 7} 64q7 -6 14 0" fill="none" stroke="${SHADOW}" stroke-width="1.6" stroke-linecap="round"/>`;
}

function renderMouth(mouth) {
  if (mouth === 'open') {
    return '<ellipse cx="64" cy="85" rx="5" ry="3.6" fill="#8c4a44"/><path d="M58 89q6 3 12 0" fill="none" stroke="#a8635a" stroke-width="2" stroke-linecap="round"/>';
  }

  if (mouth === 'smile') {
    return '<path d="M55 85q9 6 18 0" fill="none" stroke="#a8635a" stroke-width="2.4" stroke-linecap="round"/>';
  }

  return '<path d="M57 86q7 3 14 0" fill="none" stroke="#a8635a" stroke-width="2.4" stroke-linecap="round"/>';
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
    return '<g fill="none" stroke="#3a3a3a" stroke-width="1.6"><rect x="44" y="58" width="16" height="12" rx="5"/><rect x="68" y="58" width="16" height="12" rx="5"/><path d="M60 63h8"/><path d="M44 62l-8-2"/><path d="M84 62l6-2"/></g>';
  }

  if (accessories === 'sunglasses') {
    return '<g fill="#26262b"><rect x="43" y="57" width="18" height="13" rx="5"/><rect x="67" y="57" width="18" height="13" rx="5"/></g><path d="M61 62h6" stroke="#26262b" stroke-width="3"/>';
  }

  return '';
}

function renderBrows(eyebrows, color) {
  let left;
  let right;
  if (eyebrows === 'raised') {
    left = 'M46 54q6 -4 13 -1';
    right = 'M82 54q-6 -4 -13 -1';
  } else if (eyebrows === 'angled') {
    left = 'M46 54q6 1 13 3';
    right = 'M82 54q-6 1 -13 3';
  } else {
    left = 'M46 56q6 -3 13 -1';
    right = 'M82 56q-6 -3 -13 -1';
  }
  return `<path d="${left}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`
    + `<path d="${right}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`;
}

function renderNose(nose) {
  if (nose === 'button') {
    return `<path d="M63 68q-2 6 -1 8q2 1.5 5 0.5" fill="none" stroke="${SHADOW}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.45"/>`;
  }

  if (nose === 'wide') {
    return `<path d="M62 65q-4 9 -2 12q3 2 7 1" fill="none" stroke="${SHADOW}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.45"/>`
      + `<path d="M59 76q-1.5 1.5 0 2.5" fill="none" stroke="${SHADOW}" stroke-width="1.4" stroke-linecap="round" opacity="0.35"/>`
      + `<path d="M69 76q1.5 1.5 0 2.5" fill="none" stroke="${SHADOW}" stroke-width="1.4" stroke-linecap="round" opacity="0.35"/>`;
  }

  // soft (default): a single calm bridge-to-tip contour.
  return `<path d="M63 65q-3 9 -1 12q2 2 6 1" fill="none" stroke="${SHADOW}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.45"/>`;
}

function renderEarrings(earrings) {
  if (earrings === 'studs') {
    return `<circle cx="37" cy="75" r="1.9" fill="${METAL}"/><circle cx="91" cy="75" r="1.9" fill="${METAL}"/>`;
  }
  if (earrings === 'hoops') {
    return `<ellipse cx="37" cy="77" rx="2.6" ry="3.6" fill="none" stroke="${METAL}" stroke-width="1.6"/>`
      + `<ellipse cx="91" cy="77" rx="2.6" ry="3.6" fill="none" stroke="${METAL}" stroke-width="1.6"/>`;
  }
  return '';
}

// Flat-fill hats matching the portrait's clean illustrative look. `turban`
// fully covers the hair (see main).
function renderHeadwear(headwear, clothing) {
  if (headwear === 'beanie') {
    return `<path d="M33 53c0-22 14-35 31-35s31 13 31 35c-10-8-21-12-31-12s-21 4-31 12Z" fill="${clothing}"/>`
      + `<rect x="32" y="49" width="64" height="8" rx="4" fill="${clothing}"/>`;
  }
  if (headwear === 'cap') {
    return `<path d="M34 55c0-21 14-33 30-33s30 12 30 33c-10-7-20-10-30-10s-20 3-30 10Z" fill="${clothing}"/>`
      + `<path d="M30 54q34-7 68 0q-3 6 -12 7 q-22 3 -44 0 q-9 -1 -12 -7Z" fill="${clothing}"/>`;
  }
  if (headwear === 'bucket') {
    return `<path d="M37 51c0-18 12-29 27-29s27 11 27 29Z" fill="${clothing}"/>`
      + `<path d="M27 51q37 11 74 0q-4 9 -17 12 q-20 4 -40 0 q-13 -3 -17 -12Z" fill="${clothing}"/>`;
  }
  if (headwear === 'turban') {
    return `<path d="M30 56c-2-25 13-41 34-41s36 16 34 41c-6-11-10-31-34-31s-28 20-34 31Z" fill="${clothing}"/>`;
  }
  return '';
}

function renderFreckles(freckles, seed) {
  if (freckles !== 'light' && freckles !== 'heavy') {
    return '';
  }

  const random = createRandom(`${seed}:portraitfreckles`);
  const count = freckles === 'heavy' ? 16 : 9;
  let dots = '';
  for (let i = 0; i < count; i += 1) {
    const side = random() < 0.5 ? 50 : 78;
    const x = Math.round(side + (random() * 12 - 6));
    const y = Math.round(70 + random() * 8);
    dots += `<circle cx="${x}" cy="${y}" r="0.9" fill="#8a5a3b" opacity="0.5"/>`;
  }
  return dots;
}

export function renderPortraitAvatar(config) {
  const traits = config.traits;
  const palette = resolvePalette(config.palette);
  const skin = palette.skinTones[traits.skinTone] || palette.skinTones.medium;
  const hairFill = palette.hairColors[traits.hairColor] || palette.hairColors.brown;
  const browColor = palette.hairColors[traits.hairColor] || SHADOW;
  const clothing = config.traits.clothing || config.clothing || '#64748b';
  const isHijab = traits.headwear === 'hijab' || traits.hairStyle === 'hijab';
  const hidesHair = isHijab || traits.headwear === 'turban';
  const shoulderSpread = traits.gender === 'masculine' ? 40 : traits.gender === 'feminine' ? 34 : 37;
  const dims = FACE_DIMS[traits.faceShape] || FACE_DIMS.soft;

  const parts = [
    `<path d="M${64 - shoulderSpread} 128c3-19 17-30 ${shoulderSpread} -30s${shoulderSpread - 2} 11 ${shoulderSpread} 30Z" fill="${clothing}"/>`,
    `<rect x="57" y="94" width="14" height="15" rx="5" fill="${skin}"/>`,
    `<path d="M50 96q14 9 28 0" fill="none" stroke="${SHADOW}" stroke-width="4" stroke-linecap="round" opacity="0.12"/>`,
    `<ellipse cx="36" cy="68" rx="4" ry="7" fill="${skin}"/>`,
    `<ellipse cx="92" cy="68" rx="4" ry="7" fill="${skin}"/>`,
    `<ellipse cx="64" cy="66" rx="${dims.rx}" ry="${dims.ry}" fill="${skin}"/>`
  ];

  if (isHijab) {
    parts.push(`<path d="M30 112c-5-27-2-60 7-77 7-12 16-18 27-18s20 6 27 18c9 17 12 50 7 77Z" fill="${clothing}"/>`);
    parts.push(`<ellipse cx="64" cy="66" rx="22" ry="27" fill="${skin}"/>`);
  } else {
    if (!hidesHair) {
      parts.push(renderHair(traits.hairStyle, hairFill));
    }
    parts.push(renderHeadwear(traits.headwear, clothing));
  }

  parts.push(renderBrows(traits.eyebrows, browColor));

  // cheeks (blush) + freckles
  if (traits.blush === 'soft') {
    parts.push('<ellipse cx="50" cy="76" rx="6" ry="4" fill="#e8918a" opacity="0.18"/>');
    parts.push('<ellipse cx="78" cy="76" rx="6" ry="4" fill="#e8918a" opacity="0.18"/>');
  }
  parts.push(renderFreckles(traits.freckles, config.seed));

  // eyes, nose, mouth
  parts.push(eyeGroup(config, renderEye(52, traits.eyes) + renderEye(76, traits.eyes)));
  parts.push(renderNose(traits.nose));
  parts.push(renderMouth(traits.mouth));
  parts.push(renderFacialHair(traits.facialHair, hairFill));
  parts.push(renderAccessories(traits.accessories));
  parts.push(renderEarrings(traits.earrings));

  return svgFrame(config, parts.join(''));
}
