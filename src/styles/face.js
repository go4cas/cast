import { resolvePalette } from '../palettes.js';
import { svgFrame } from './common.js';

// Deterministic dot pattern used for the stubble hair/beard styles. Walks a
// hex-packed grid over the given box and emits a tiny circle wherever `test`
// passes, producing a stippled "5 o'clock shadow" look with no randomness.
function stipple(fill, opacity, { x0, x1, y0, y1, step, r, test }) {
  const dots = [];
  let row = 0;

  for (let y = y0; y <= y1; y += step) {
    const offset = row % 2 ? step / 2 : 0;
    for (let x = x0 + offset; x <= x1; x += step) {
      if (test(x, y)) {
        dots.push(`<circle cx="${Math.round(x)}" cy="${Math.round(y)}" r="${r}"/>`);
      }
    }
    row += 1;
  }

  return `<g fill="${fill}" opacity="${opacity}">${dots.join('')}</g>`;
}

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

function renderHair(hairStyle, fill) {
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

  if (hairStyle === 'afro') {
    return `<path d="M22 70c-4-34 16-54 42-54s46 20 42 54c-8-20-22-30-42-30s-34 10-42 30Z" ${attrs}/>`;
  }

  if (hairStyle === 'mohawk') {
    return `<path d="M55 54c0-24 3-40 9-40s9 16 9 40Z" ${attrs}/>`;
  }

  if (hairStyle === 'spiky') {
    return `<path d="M32 56 40 28 48 50 56 24 64 52 72 24 80 50 88 28 96 56Z" ${attrs}/>`;
  }

  if (hairStyle === 'stubble') {
    return stipple(fill, 0.6, {
      x0: 34, x1: 94, y0: 28, y1: 52, step: 5, r: 0.7,
      test: (x, y) => (x - 64) ** 2 + (y - 64) ** 2 <= 34 ** 2
    });
  }

  return `<path d="M30 57c1-23 15-36 34-36s33 13 34 36c-19-13-49-13-68 0Z" ${attrs}/>`;
}

function renderHeadwear(headwear) {
  if (headwear === 'beanie') {
    return '<path d="M31 54c1-22 15-35 33-35s32 13 33 35H31Z" fill="#334155"/><path d="M31 53h66" stroke="#64748b" stroke-width="8" stroke-linecap="round"/>';
  }

  if (headwear === 'cap') {
    return '<path d="M62 53h46c3 0 4 5 0 7-19 3-33 1-46-3Z" fill="#7f1d1d"/><path d="M33 53c2-21 14-32 31-32s29 11 31 32H33Z" fill="#b91c1c"/><circle cx="64" cy="22" r="3" fill="#7f1d1d"/>';
  }

  if (headwear === 'turban') {
    return '<path d="M30 55c0-23 16-36 34-36s34 13 34 36H30Z" fill="#0f766e"/><path d="M32 50q32-20 64 0" fill="none" stroke="#14b8a6" stroke-width="4"/><path d="M34 41q30-16 60 0" fill="none" stroke="#14b8a6" stroke-width="4"/><circle cx="34" cy="47" r="5" fill="#14b8a6"/>';
  }

  if (headwear === 'bucket') {
    return '<path d="M41 50c0-18 10-29 23-29s23 11 23 29H41Z" fill="#a16207"/><path d="M27 49h74c3 0 4 7 0 9-12 3-62 3-74 0-4-2-3-9 0-9Z" fill="#ca8a04"/>';
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
  if (facialHair === 'stubble') {
    return stipple('#3f2d20', 0.42, {
      x0: 40, x1: 88, y0: 70, y1: 96, step: 5, r: 0.6,
      test: (x, y) =>
        (x - 64) ** 2 + (y - 64) ** 2 <= 34 ** 2 &&
        ((x - 64) / 10) ** 2 + ((y - 82) / 7) ** 2 > 1 &&
        !(Math.abs(x - 64) < 7 && y < 78)
    });
  }

  if (facialHair === 'mustache') {
    return '<path d="M51 75c6-5 10-5 13 0 3-5 7-5 13 0-7 6-18 6-26 0Z" fill="#3f2d20" opacity="0.9"/>';
  }

  if (facialHair === 'goatee') {
    return '<rect x="61" y="78" width="6" height="5" rx="2" fill="#3f2d20" opacity="0.9"/><path d="M55 86c0 9 4 15 9 15s9-6 9-15c-4 4-14 4-18 0Z" fill="#3f2d20" opacity="0.9"/>';
  }

  if (facialHair === 'beard') {
    return '<path d="M43 80c5 21 37 21 42 0-8 16-34 16-42 0Z" fill="#3f2d20" opacity="0.9"/>';
  }

  if (facialHair === 'fullBeard') {
    return '<path d="M49 74c5-4 9-4 15 0 6-4 10-4 15 0-7 5-23 5-30 0Z" fill="#3f2d20" opacity="0.9"/><path d="M39 68c-1 24 9 42 25 42s26-18 25-42c-5 20-11 27-25 27s-20-7-25-27Z" fill="#3f2d20" opacity="0.9"/>';
  }

  if (facialHair === 'sideburns') {
    return '<path d="M41 52c-2 12-1 22 3 30 2-2 3-5 2-10-1-7-1-14-1-20Z" fill="#3f2d20" opacity="0.9"/><path d="M87 52c2 12 1 22-3 30-2-2-3-5-2-10 1-7 1-14 1-20Z" fill="#3f2d20" opacity="0.9"/>';
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

function renderEyebrows(eyebrows, color) {
  const attrs = `fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"`;

  if (eyebrows === 'raised') {
    return `<path d="M41 50q7-5 14 0" ${attrs}/><path d="M73 50q7-5 14 0" ${attrs}/>`;
  }

  if (eyebrows === 'angled') {
    return `<path d="M41 49l14-3" ${attrs}/><path d="M87 49l-14-3" ${attrs}/>`;
  }

  return `<path d="M41 49h14" ${attrs}/><path d="M73 49h14" ${attrs}/>`;
}

function renderNose(nose) {
  const attrs = 'fill="none" stroke="#9a5b38" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"';

  if (nose === 'button') {
    return `<path d="M60 71q4 5 8 0" ${attrs}/>`;
  }

  if (nose === 'wide') {
    return `<path d="M64 62l-7 14h14" ${attrs}/>`;
  }

  return `<path d="M64 63l-5 13h9" ${attrs}/>`;
}

function renderFreckles(freckles) {
  if (freckles !== 'light' && freckles !== 'heavy') {
    return '';
  }

  return stipple('#8a5a3b', 0.5, {
    x0: 42, x1: 86, y0: 64, y1: 76, step: freckles === 'heavy' ? 5 : 7, r: 1.1,
    test: (x, y) => (x - 64) ** 2 + (y - 64) ** 2 <= 33 ** 2 && Math.abs(x - 64) > 8
  });
}

function renderBlush(blush) {
  if (blush !== 'soft') {
    return '';
  }

  return '<ellipse cx="46" cy="68" rx="6" ry="4" fill="#fb7185" opacity="0.35"/><ellipse cx="82" cy="68" rx="6" ry="4" fill="#fb7185" opacity="0.35"/>';
}

function renderEarrings(earrings) {
  if (earrings === 'studs') {
    return '<circle cx="30" cy="74" r="3" fill="#fde047"/><circle cx="98" cy="74" r="3" fill="#fde047"/>';
  }

  if (earrings === 'hoops') {
    return '<circle cx="30" cy="77" r="5" fill="none" stroke="#fde047" stroke-width="2.5"/><circle cx="98" cy="77" r="5" fill="none" stroke="#fde047" stroke-width="2.5"/>';
  }

  return '';
}

function renderCollar(gender) {
  const attrs = 'fill="none" stroke="#00000030" stroke-width="3" stroke-linecap="round"';

  if (gender === 'masculine') {
    return `<path d="M56 92l8 11 8-11" ${attrs}/>`;
  }

  if (gender === 'feminine') {
    return `<path d="M54 94q10 12 20 0" ${attrs}/>`;
  }

  return `<path d="M55 96h18" ${attrs}/>`;
}

export function renderFaceAvatar(config) {
  const traits = config.traits;
  const palette = resolvePalette(config.palette);
  const skin = palette.skinTones[traits.skinTone] || palette.skinTones.medium;
  const hairFill = palette.hairColors[traits.hairColor] || palette.hairColors.brown;
  const browColor = palette.hairColors[traits.hairColor] || '#3f2d20';
  const clothing = config.clothing || '#64748b';
  const headwear = traits.headwear;
  const hair = headwear === 'none' ? renderHair(traits.hairStyle, hairFill) : '';
  const backLayer = headwear === 'hijab' ? renderHeadwear(headwear) : '';
  const frontLayer = headwear === 'hijab' ? '' : renderHeadwear(headwear);

  return svgFrame(config, [
    `<path d="M24 128c5-24 21-38 40-38s35 14 40 38H24Z" fill="${clothing}"/>`,
    renderCollar(traits.gender),
    backLayer,
    faceShapePath(traits.faceShape, skin),
    renderEarrings(traits.earrings),
    hair,
    frontLayer,
    renderEyebrows(traits.eyebrows, browColor),
    renderEyes(traits.eyes),
    renderNose(traits.nose),
    renderFreckles(traits.freckles),
    renderBlush(traits.blush),
    renderMouth(traits.mouth),
    renderFacialHair(traits.facialHair),
    renderAccessories(traits.accessories)
  ].join(''));
}
