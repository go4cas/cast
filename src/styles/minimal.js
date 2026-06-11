import { resolvePalette } from '../palettes.js';
import { svgFrame } from './common.js';

// Flat geometric / minimal face: bold rounded shapes, muted flat fills, no
// outlines, and reduced features. Shares the face trait set but renders a
// clean, modern silhouette rather than detailed features.

function renderHair(hairStyle, fill) {
  if (hairStyle === 'none' || hairStyle === 'hijab') {
    return '';
  }

  if (hairStyle === 'bun') {
    return `<circle cx="64" cy="24" r="9" fill="${fill}"/><path d="M40 50a24 22 0 0 1 48 0c-8-7-40-7-48 0Z" fill="${fill}"/>`;
  }

  if (hairStyle === 'long' || hairStyle === 'afro' || hairStyle === 'curly' || hairStyle === 'coily') {
    return `<path d="M34 96c-4-22-3-50 4-62a26 26 0 0 1 52 0c7 12 8 40 4 62-6-5-8-16-8-34-6 5-13 7-22 7s-16-2-22-7c0 18-2 29-8 34Z" fill="${fill}"/>`;
  }

  return `<path d="M38 54a26 25 0 0 1 52 0c-8-7-44-7-52 0Z" fill="${fill}"/>`;
}

export function renderMinimalAvatar(config) {
  const traits = config.traits;
  const palette = resolvePalette(config.palette);
  const skin = palette.skinTones[traits.skinTone] || palette.skinTones.medium;
  const hairFill = palette.hairColors[traits.hairColor] || palette.hairColors.brown;
  const clothing = config.clothing || '#64748b';
  const isHijab = traits.headwear === 'hijab' || traits.hairStyle === 'hijab';

  const parts = [
    `<rect x="28" y="92" width="72" height="44" rx="22" fill="${clothing}"/>`,
    `<rect x="36" y="58" width="5" height="10" rx="2.5" fill="${skin}"/>`,
    `<rect x="87" y="58" width="5" height="10" rx="2.5" fill="${skin}"/>`,
    `<rect x="40" y="32" width="48" height="58" rx="22" fill="${skin}"/>`
  ];

  if (isHijab) {
    parts.push(`<path d="M34 104c-3-24-1-52 6-64a24 26 0 0 1 48 0c7 12 9 40 6 64Z" fill="${clothing}"/>`);
    parts.push(`<rect x="46" y="40" width="36" height="46" rx="18" fill="${skin}"/>`);
  } else {
    parts.push(renderHair(traits.hairStyle, hairFill));
  }

  // minimal features: two soft square eyes and a short mouth bar
  parts.push('<rect x="51" y="60" width="6" height="6" rx="3" fill="#2b2b2b"/>');
  parts.push('<rect x="71" y="60" width="6" height="6" rx="3" fill="#2b2b2b"/>');

  if (traits.mouth === 'open') {
    parts.push('<circle cx="64" cy="76" r="3.5" fill="#2b2b2b" opacity="0.65"/>');
  } else if (traits.mouth === 'smile') {
    parts.push('<path d="M58 75q6 5 12 0" fill="none" stroke="#2b2b2b" stroke-width="3" stroke-linecap="round" opacity="0.65"/>');
  } else {
    parts.push('<rect x="58" y="75" width="12" height="3" rx="1.5" fill="#2b2b2b" opacity="0.6"/>');
  }

  if (traits.accessories === 'glasses' || traits.accessories === 'sunglasses') {
    const fill = traits.accessories === 'sunglasses' ? '#2b2b2b' : 'none';
    parts.push(`<g fill="${fill}" stroke="#2b2b2b" stroke-width="2"><rect x="47" y="57" width="13" height="11" rx="3"/><rect x="68" y="57" width="13" height="11" rx="3"/><path d="M60 62h8" stroke-width="2"/></g>`);
  }

  return svgFrame(config, parts.join(''));
}
