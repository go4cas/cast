import { createRandom } from '../hash.js';
import { shapeColor, svgFrame } from './common.js';

export function renderAbstractAvatar(config) {
  const random = createRandom(`${config.seed}:abstract`);
  const shapes = Array.from({ length: 9 }, (_, index) => {
    const color = shapeColor(random, index);
    const x = Math.round(random() * 112);
    const y = Math.round(random() * 112);
    const size = Math.round(14 + random() * 32);
    const opacity = (0.35 + random() * 0.45).toFixed(2);
    const rotate = Math.round(random() * 180);

    if (index % 3 === 0) {
      return `<circle cx="${x}" cy="${y}" r="${Math.round(size / 2)}" fill="${color}" opacity="${opacity}"/>`;
    }

    if (index % 3 === 1) {
      return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${Math.round(size / 4)}" fill="${color}" opacity="${opacity}" transform="rotate(${rotate} ${x + size / 2} ${y + size / 2})"/>`;
    }

    return `<path d="M${x} ${y + size}l${Math.round(size / 2)}-${size} ${size} ${size}Z" fill="${color}" opacity="${opacity}"/>`;
  }).join('');

  return svgFrame(config, shapes);
}
