# Changelog

All notable changes to this project are documented in this file. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

A change to the generated SVG for an existing seed is treated as a breaking
change — see "Stability and versioning" in the README.

## [Unreleased]

### Added

- "Use from a CDN" documentation (jsDelivr `/+esm` and version-pinned raw ESM).
- `web-component`, `typescript`, `pfp`, and `profile-picture` keywords.
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

[Unreleased]: https://github.com/go4cas/cast/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/go4cas/cast/releases/tag/v0.1.0
