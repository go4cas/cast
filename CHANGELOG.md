# Changelog

All notable changes to this project are documented in this file. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

A change to the generated SVG for an existing seed is treated as a breaking
change — see "Stability and versioning" in the README.

## [Unreleased]

## [1.6.0] - 2026-06-15

### Added

- `animate: 'blink'` — a subtle eye-blink for the face styles (`portrait`, `studio`, `cartoon`). The CSS is scoped to the individual avatar (so it never blinks others on the page) and respects `prefers-reduced-motion`. Existing output is unchanged unless `animate: 'blink'` is set.
- Status badge `icon` option — set `status: { state, icon: true }` to draw a colorblind-safe shape glyph on the dot (check / minus / clock / cross), so presence is distinguishable without relying on color alone. Defaults to `false`.
- `createAvatarGroup` now accepts member objects (`{ seed, ...perMemberOptions }`) alongside plain seeds, so a customized member renders with its own look inside the group mark. Plain-seed groups are unchanged.

## [1.5.0] - 2026-06-15

### Added

- `decorative` option — render the SVG with `aria-hidden="true"` (and no role/label/title) so assistive tech skips it, for avatars that sit beside their own visible name. Defaults to `false` (a labelled `role="img"` image).
- A native `<title>` element is now emitted alongside the existing `aria-label`, giving a hover tooltip and broader screen-reader support.
- Colorblind-safe palette preset (Okabe–Ito based). Opt in with `palette: 'accessible'` (or `'colorblind-safe'`); it recolors the abstract styles, clothing, and inks while keeping skin and hair natural. Exported as `COLORBLIND_SAFE_PALETTE` / `PALETTE_PRESETS`, and `resolvePalette` now accepts a preset name. `resolvePalette` is also re-exported from the package entry.

## [1.4.0] - 2026-06-12

### Added

- `createAvatarGroup(seeds, options)` — compose several member seeds into one cohesive group mark (a clipped mosaic of 1–4 tiles, with extra members collapsing into a `+N` chip). Great for team/squad/group-DM icons.
- `mergeSeeds(...seeds)` — combine seeds into a single deterministic, order-independent seed for a stable "pair"/relationship avatar.

## [1.3.0] - 2026-06-12

### Added

- `animate` option — a subtle looping animation (`breathe`, `bounce`) applied to the avatar content via deterministic, dependency-free CSS that respects `prefers-reduced-motion`. Works on every style.
- Documented edge / serverless rendering: `createAvatar` and the other string helpers have no DOM/Node APIs, so they run on Cloudflare Workers, Vercel/Netlify Edge, Deno, and Bun. Added an "Edge & server rendering" guide and example.

## [1.2.0] - 2026-06-12

### Added

- `expression` option — a shorthand (`neutral`, `happy`, `sad`, `surprised`, `thinking`, `wink`) that presets eyes/mouth/eyebrows while keeping identity seed-stable, so the same avatar can reflect a mood or agent state. Explicit `traits` still take precedence; applies to the face styles.

## [1.1.0] - 2026-06-12

### Added

- `studio` style — a softly-shaded, more realistic portrait (gradient skin, detailed irises with a catch-light, shaped lips). Reuses the face trait set.

### Fixed

- Open-mouth (`mouth: 'open'`) on the `cartoon`, `portrait`, and `studio` styles drew a stray line across the mouth; it now renders as parted lips with the lip below the opening.

## [1.0.0] - 2026-06-11

First stable release. The public API and trait/option vocabulary are now
considered stable and follow semantic versioning — a change to the generated
SVG for an existing seed will be a major bump.

### Added

- Brand logo (`logo.svg`).
- Redesigned product landing page / demo.

## [0.6.0] - 2026-06-11

### Changed

- Moved `clothing` into `traits` (`traits.clothing`) so it sits with the other identity features — it's the one free-color trait (a CSS color or `'auto'`). Top-level `clothing` is still accepted as a legacy alias, and avatars encoded before this change still render their clothing color.

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

[Unreleased]: https://github.com/go4cas/cast/compare/v1.6.0...HEAD
[1.6.0]: https://github.com/go4cas/cast/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/go4cas/cast/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/go4cas/cast/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/go4cas/cast/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/go4cas/cast/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/go4cas/cast/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/go4cas/cast/compare/v0.6.0...v1.0.0
[0.6.0]: https://github.com/go4cas/cast/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/go4cas/cast/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/go4cas/cast/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/go4cas/cast/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/go4cas/cast/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/go4cas/cast/releases/tag/v0.1.0
