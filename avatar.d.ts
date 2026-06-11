// Type declarations for cast-avatar.
// The source is dependency-free ES module JavaScript (src/avatar.js); these
// declarations describe its public API for TypeScript consumers.

export type AvatarStyle =
  | 'face'
  | 'portrait'
  | 'minimal'
  | 'line'
  | 'initials'
  | 'shapes'
  | 'pixel'
  | 'bot'
  | 'mesh';

/** Built-in background keywords (any CSS color is also accepted). */
export type BackgroundKeyword = 'auto' | 'transparent' | 'gradient' | 'dots' | 'rings' | 'grid';

/**
 * Override any of the default color sets to theme avatars (e.g. to a brand
 * palette). Tone maps (`skinTones`/`hairColors`) merge over the defaults;
 * color lists replace the defaults when provided.
 */
export interface AvatarPalette {
  skinTones?: Record<string, string>;
  hairColors?: Record<string, string>;
  backgrounds?: string[];
  shapeColors?: string[];
  clothingColors?: string[];
  inks?: string[];
}

/** Presence state shown by the status badge. */
export type Status = 'online' | 'busy' | 'away' | 'offline';

/** Corner placement for a `dot` status badge. */
export type StatusPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/** Full status badge configuration. */
export interface StatusBadge {
  state: Status;
  /** `dot` = corner badge (default); `ring` = colored border around the avatar. */
  shape?: 'dot' | 'ring';
  /** Corner for the `dot` shape; ignored for `ring`. Defaults to `bottom-right`. */
  position?: StatusPosition;
  /** Animate the badge with a pulse. */
  pulse?: boolean;
}
export type Gender = 'neutral' | 'feminine' | 'masculine';
export type SkinTone = 'light' | 'mediumLight' | 'medium' | 'mediumDark' | 'dark';
export type FaceShape = 'round' | 'oval' | 'soft';
export type HairStyle =
  | 'none'
  | 'stubble'
  | 'short'
  | 'long'
  | 'curly'
  | 'coily'
  | 'bun'
  | 'afro'
  | 'mohawk'
  | 'spiky'
  | 'hijab';
export type HairColor = 'black' | 'brown' | 'blonde' | 'red' | 'gray' | 'white';
export type Eyes = 'round' | 'smile' | 'sleepy' | 'wink';
export type Mouth = 'smile' | 'neutral' | 'open';
export type FacialHair =
  | 'none'
  | 'stubble'
  | 'mustache'
  | 'goatee'
  | 'beard'
  | 'fullBeard'
  | 'sideburns';
export type Headwear = 'none' | 'beanie' | 'cap' | 'turban' | 'bucket' | 'hijab';
export type Accessories = 'none' | 'glasses' | 'sunglasses';
export type Eyebrows = 'flat' | 'raised' | 'angled';
export type Nose = 'soft' | 'button' | 'wide';
export type Freckles = 'none' | 'light' | 'heavy';
export type Blush = 'none' | 'soft';
export type Earrings = 'none' | 'studs' | 'hoops';

/** Any trait may be set to `'auto'` to let the seed decide. */
export type Auto<T> = T | 'auto';

/** Trait inputs. Omitted or `'auto'` traits are derived deterministically from the seed. */
export interface AvatarTraits {
  gender?: Auto<Gender>;
  skinTone?: Auto<SkinTone>;
  faceShape?: Auto<FaceShape>;
  hairStyle?: Auto<HairStyle>;
  hairColor?: Auto<HairColor>;
  eyebrows?: Auto<Eyebrows>;
  eyes?: Auto<Eyes>;
  nose?: Auto<Nose>;
  mouth?: Auto<Mouth>;
  facialHair?: Auto<FacialHair>;
  freckles?: Auto<Freckles>;
  blush?: Auto<Blush>;
  headwear?: Auto<Headwear>;
  earrings?: Auto<Earrings>;
  accessories?: Auto<Accessories>;
}

/** Fully resolved traits, as produced by {@link resolveAvatarOptions}. */
export interface ResolvedAvatarTraits {
  gender: Gender;
  skinTone: SkinTone;
  faceShape: FaceShape;
  hairStyle: HairStyle;
  hairColor: HairColor;
  eyebrows: Eyebrows;
  eyes: Eyes;
  nose: Nose;
  mouth: Mouth;
  facialHair: FacialHair;
  freckles: Freckles;
  blush: Blush;
  headwear: Headwear;
  earrings: Earrings;
  accessories: Accessories;
}

export interface AvatarOptions {
  /** Stable identity input. `name` and `id` are accepted as aliases. */
  seed?: string | number;
  name?: string | number;
  id?: string | number;
  style?: Auto<AvatarStyle>;
  /** Rendered pixel size, clamped to 24–1024. Defaults to 128. */
  size?: number;
  traits?: AvatarTraits;
  /**
   * Background fill. A CSS color, `'transparent'`, a seeded `'gradient'`, a
   * seeded pattern (`'dots'`, `'rings'`, `'grid'`), or `'auto'` / omitted to
   * pick a color from the palette.
   */
  background?: BackgroundKeyword | (string & {});
  /** CSS color for clothing/shoulders. `'auto'` or omitted picks from the palette. */
  clothing?: 'auto' | (string & {});
  /** Presence badge. A state string (corner dot) or a full config object. Omitted = no badge. */
  status?: Status | StatusBadge;
  /** Override the default color sets (skin tones, hair, backgrounds, etc.). */
  palette?: AvatarPalette;
  /** Monogram font weight for the `initials` style (default `800`). */
  fontWeight?: number | string;
  /** Monogram font family for the `initials` style. */
  fontFamily?: string;
  /** Corner radius for the frame; number (px) or CSS length. Defaults to `'50%'`. */
  radius?: number | string;
  /** Accessible title / aria-label. Defaults to `` `${seed} avatar` ``. */
  title?: string;
  /** Explicit initials for the `initials` style. */
  initials?: string;
  /** Legacy alias for `traits.hairStyle`. */
  hair?: Auto<HairStyle>;
}

/** A resolved, serializable avatar configuration. */
export interface ResolvedAvatarConfig {
  version: 1;
  seed: string;
  style: AvatarStyle;
  size: number;
  traits: ResolvedAvatarTraits;
  background: string;
  clothing: string;
  radius: number | string;
  title: string;
  initials?: string;
  fontWeight?: number | string;
  fontFamily?: string;
  status?: Status | StatusBadge;
  palette?: AvatarPalette;
}

/** The full set of allowed values for each option, keyed by trait name. */
export interface AvatarOptionSets {
  style: AvatarStyle[];
  gender: Gender[];
  skinTone: SkinTone[];
  faceShape: FaceShape[];
  hairStyle: HairStyle[];
  hairColor: HairColor[];
  eyebrows: Eyebrows[];
  eyes: Eyes[];
  nose: Nose[];
  mouth: Mouth[];
  facialHair: FacialHair[];
  freckles: Freckles[];
  blush: Blush[];
  headwear: Headwear[];
  earrings: Earrings[];
  accessories: Accessories[];
}

/** First argument of the public helpers: a bare seed or an options object. */
export type SeedOrOptions = string | number | AvatarOptions;

/** Resolve a seed/options pair into a complete, deterministic configuration. */
export function resolveAvatarOptions(
  seedOrOptions?: SeedOrOptions,
  maybeOptions?: AvatarOptions
): ResolvedAvatarConfig;

/** Short, stable hash of the resolved configuration (base-36). */
export function avatarHash(seedOrOptions?: SeedOrOptions, maybeOptions?: AvatarOptions): string;

/** Encode an avatar to a portable, hash-checked string (`ca1.<hash>.<payload>`). */
export function encodeAvatar(seedOrOptions?: SeedOrOptions, maybeOptions?: AvatarOptions): string;

/**
 * Decode a string produced by {@link encodeAvatar}.
 * @throws if the string is malformed or the embedded hash does not match.
 */
export function decodeAvatar(encoded: string): ResolvedAvatarConfig;

/** Render an avatar to an SVG string. Accepts a seed, options, or a resolved config. */
export function createAvatar(
  seedOrOptions?: SeedOrOptions | ResolvedAvatarConfig,
  maybeOptions?: AvatarOptions
): string;

/** Render many avatars at once. Each item is a seed or options object; `sharedOptions` is merged under each. */
export function createAvatars(
  items: Array<SeedOrOptions>,
  sharedOptions?: AvatarOptions
): string[];

/** Options for {@link createAvatarSprite}: grid layout plus shared avatar options. */
export interface SpriteOptions extends AvatarOptions {
  /** Avatars per row (default 8). */
  columns?: number;
  /** Pixel size of each avatar cell (default 64). */
  cell?: number;
  /** Gap in px between cells (default 8). */
  gap?: number;
}

/** Render a roster of avatars into a single SVG sprite-sheet grid. */
export function createAvatarSprite(
  items: Array<SeedOrOptions>,
  options?: SpriteOptions
): string;

/** Wrap an SVG string in a `data:image/svg+xml` URI. */
export function toDataUri(svg: string): string;

/** Render an avatar directly to a `data:image/svg+xml` URI. */
export function createAvatarDataUri(
  seedOrOptions?: SeedOrOptions | ResolvedAvatarConfig,
  maybeOptions?: AvatarOptions
): string;

/**
 * Render an avatar to a detached `SVGElement`.
 * Requires a DOM environment; throws otherwise.
 */
export function createAvatarElement(
  seedOrOptions?: SeedOrOptions | ResolvedAvatarConfig,
  maybeOptions?: AvatarOptions
): SVGElement | null;

/**
 * Render an avatar and mount it into `target` (a selector or element).
 * Requires a DOM environment; throws otherwise. Returns the SVG string.
 */
export function mountAvatar(
  target: string | Element,
  seedOrOptions?: SeedOrOptions | ResolvedAvatarConfig,
  maybeOptions?: AvatarOptions
): string;

/** The allowed values for every trait (re-export of the internal option table). */
export const avatarOptions: AvatarOptionSets;
