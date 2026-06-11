# Changelog

All notable changes to this project are documented in this file. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

A change to the generated SVG for an existing seed is treated as a breaking
change — see "Stability and versioning" in the README.

## [Unreleased]

## [0.5.0] - 2026-06-11

### Changed

- Renamed the `face` style to `cartoon` (the old `face` value still works as an alias).
- The default style (when none is requested) is now `portrait` instead of a seed-random style.
- Demo: redesigned with a modern two-column layout; reordered the style gallery and dropdown; deployed via GitHub Actions.

## [0.4.0] - 2026-06-11

### Added

- `palette` option — override the default color sets (skin tones, hair, backgrounds, shape colors, clothing, inks) to theme avatars; works across every style and is preserved through encode/decode.
- `createAvatars(items, sharedOptions)` and `createAvatarSprite(items, options)` — render a roster of avatars in one call (array of SVGs, or a single SVG sprite-sheet grid).
- `fontWeight` and `fontFamily` options for the `initials` monogram.

## [0.3.0] - 2026-06-10

### Added

- `minimal` style — a flat geometric face (bold rounded shapes, muted fills, reduced features).
- `line` style — a monochrome thin-line (shadcn-flavored) face in a seeded dark ink.
- `mesh` style — an abstract seeded gradient-blob avatar.
- Background patterns: `dots`, `rings`, and `grid` (seeded), alongside the existing color/`transparent`/`gradient` options.
- `status` option — a presence badge on any style. Accepts a state string (`online`, `busy`, `away`, `offline`) for a corner dot, or an object `{ state, shape: 'dot' | 'ring', position, pulse }` for a ring border, custom corner placement, or a pulsing animation.

## [0.2.0] - 2026-06-10

### Added

- `portrait` style — a refined, less-cartoony illustrative face (oval head, almond lidded eyes, subtle features) sharing the `face` trait set.
- "Use from a CDN" documentation (jsDelivr `/+esm` and version-pinned raw ESM).
- npm version, CI, bundle-size, and license badges, plus a DiceBear credit, in the README.
- `web-component`, `typescript`, `pfp`, and `profile-picture` keywords for npm discoverability.
- `engines` field declaring Node >= 18.

## [0.1.0] - 2026-06-09

### Added

- Initial release.
- Deterministic SVG avatar generator: `createAvatar`, `mountAvatar`,
  `createAvatarElement`, `createAvatarDataUri`, and `toDataUri`.
- Five styles: `face`, `initials`, `shapes`, `pixel`, and `bot`.
- Rich `face` trait system — gender, skin tone, face shape, hair style and
  color, eyebrows, eyes, nose, mouth, facial hair, freckles, blush, headwear,
  earrings, and accessories — plus a clothing color. Each trait resolves from
  its own seed-derived stream.
- Background options: solid color, `transparent`, and a seeded `gradient`.
- Persistence helpers: `avatarHash`, hash-verified `encodeAvatar` /
  `decodeAvatar`, and `resolveAvatarOptions`.
- `<cast-avatar>` custom element via the `cast-avatar/element` entry point.
- TypeScript declarations for the library and the custom element.
- Dependency-free with no build step.

[Unreleased]: https://github.com/go4cas/cast/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/go4cas/cast/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/go4cas/cast/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/go4cas/cast/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/go4cas/cast/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/go4cas/cast/releases/tag/v0.1.0
