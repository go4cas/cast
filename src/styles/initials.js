import { createRandom } from '../hash.js';
import { escapeText, initialsFrom, shapeColor, svgFrame } from './common.js';

export function renderInitialsAvatar(config) {
  const random = createRandom(`${config.seed}:initials`);
  const foreground = shapeColor(random);
  const initials = escapeText(config.initials || initialsFrom(config.seed));

  return svgFrame(
    config,
    `<text x="64" y="75" text-anchor="middle" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="42" font-weight="800" fill="${foreground}">${initials}</text>`
  );
}
