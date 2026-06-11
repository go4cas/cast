import { createRandom } from '../hash.js';
import { resolvePalette } from '../palettes.js';
import { colorAt, escapeText, initialsFrom, svgFrame } from './common.js';

export function renderInitialsAvatar(config) {
  const random = createRandom(`${config.seed}:initials`);
  const foreground = colorAt(resolvePalette(config.palette).shapeColors, random);
  const initials = escapeText(config.initials || initialsFrom(config.seed));
  const fontFamily = escapeText(config.fontFamily || "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif");
  const fontWeight = escapeText(config.fontWeight ?? 800);

  return svgFrame(
    config,
    `<text x="64" y="75" text-anchor="middle" font-family="${fontFamily}" font-size="42" font-weight="${fontWeight}" fill="${foreground}">${initials}</text>`
  );
}
