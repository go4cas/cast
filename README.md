<p align="center">
  <img src="logo.svg" width="96" height="96" alt="Cast logo">
</p>

# Cast Avatar

[![npm version](https://img.shields.io/npm/v/cast-avatar)](https://www.npmjs.com/package/cast-avatar)
[![tests](https://img.shields.io/github/actions/workflow/status/go4cas/cast/test.yml?branch=main&label=tests)](https://github.com/go4cas/cast/actions/workflows/test.yml)
[![license](https://img.shields.io/npm/l/cast-avatar)](./LICENSE)

**[Live demo →](https://go4cas.github.io/cast/)** — try every style and trait in the browser.

Cast Avatar is a tiny, dependency-free JavaScript library for creating deterministic SVG avatars without network access. It is inspired by [DiceBear](https://www.dicebear.com/) and similar avatar systems that turn a stable seed into repeatable faces, initials, or geometric shapes.

## Goals

- **Offline-first:** no remote images, fonts, APIs, or package dependencies are required.
- **Deterministic:** the same seed and options always generate the same SVG.
- **Persistable:** `avatarHash()` creates a compact lookup key, while `encodeAvatar()` stores the exact resolved avatar configuration.
- **Framework-free:** use it with plain HTML, CSS, and JavaScript.
- **Inclusive traits:** apps can choose or auto-generate skin tone, face shape, hair, eyebrows, eye shape, nose, mouth, gender presentation, facial hair, freckles, blush, headwear, earrings, accessories, and clothing color.

## Install

```sh
npm install cast-avatar
```

```js
import { createAvatar } from 'cast-avatar';

const svg = createAvatar('ada@example.com', { style: 'face' });
```

The package ships as ES module source with no build step, and includes
TypeScript declarations (`avatar.d.ts`) so every option and trait is typed.

## Use from a CDN

No build or install needed — `cast-avatar` is served from npm CDNs. Use
jsDelivr's auto-bundled, minified single file:

```html
<script type="module">
  import { createAvatar } from 'https://cdn.jsdelivr.net/npm/cast-avatar@0.1.0/+esm';
  document.body.innerHTML = createAvatar('ada@example.com', { style: 'face' });
</script>
```

Or import the raw ES module source (also works on
[unpkg](https://unpkg.com/cast-avatar/)):

```html
<script type="module">
  import { createAvatar } from 'https://cdn.jsdelivr.net/npm/cast-avatar@0.1.0/src/avatar.js';
</script>
```

The `<cast-avatar>` element works the same way — importing it registers the tag:

```html
<script type="module">
  import 'https://cdn.jsdelivr.net/npm/cast-avatar@0.1.0/element/+esm';
</script>
<cast-avatar seed="ada@example.com" variant="face" size="96"></cast-avatar>
```

Pin the version (`@0.1.0`) in production: an unpinned URL serves the latest
release, which can change an existing seed's avatar — see
[Stability and versioning](#stability-and-versioning).

## Quick start

The snippets below import from `./src/avatar.js` so they run directly from a
clone (open `index.html` with no build); when installed from npm, import from
`cast-avatar` instead.

```html
<div id="avatar"></div>
<script type="module">
  import { avatarHash, encodeAvatar, mountAvatar } from './src/avatar.js';

  const options = {
    seed: 'ada@example.com',
    style: 'face',
    traits: {
      gender: 'feminine',
      skinTone: 'medium',
      hairStyle: 'curly',
      hairColor: 'black',
      eyes: 'round',
      accessories: 'glasses'
    }
  };

  mountAvatar('#avatar', options);
  console.log(avatarHash(options));
  console.log(encodeAvatar(options));
</script>
```

## API

### `createAvatar(options)` or `createAvatar(seed, options)`

Returns an SVG string. Use either an options object or a seed with options as the second argument.

```js
import { createAvatar } from './src/avatar.js';

const svg = createAvatar('user-123', { style: 'shapes', size: 96 });
```

### `mountAvatar(target, options)` or `mountAvatar(target, seed, options)`

Renders the SVG into a DOM element or selector and returns the generated SVG string.

```js
mountAvatar(document.querySelector('[data-avatar]'), 'Lin Chen', { style: 'face' });
```

### `avatarHash(options)`

Returns a deterministic base-36 hash for a resolved avatar configuration. Use this as a compact lookup key when you also store the seed/options somewhere else.

```js
const hash = avatarHash({ seed: 'user-123', traits: { skinTone: 'dark', hairStyle: 'coily' } });
```

### `encodeAvatar(options)` and `decodeAvatar(encoded)`

Use these helpers when your app needs to persist the exact avatar that was generated, including all `auto` choices after they resolve.

```js
const encoded = encodeAvatar({ seed: 'user-123', traits: { skinTone: 'dark' } });
const config = decodeAvatar(encoded);
const svg = createAvatar(config);
```

Encoded strings include a version prefix and an integrity hash so tampered payloads are rejected.

### `toDataUri(svg)` and `createAvatarDataUri(options)`

Use these helpers for `img` tags.

```js
const uri = createAvatarDataUri({ seed: 'user-123' });
document.querySelector('img').src = uri;
```

### `createAvatarElement(options)`

Creates a browser `SVGElement` without mounting it.

```js
const element = createAvatarElement({ seed: 'user-123' });
document.body.append(element);
```

### `resolveAvatarOptions(options)`

Returns the deterministic, fully-resolved option set used by the renderer. This is useful for debugging or storing the final values that `auto` produced.

### `avatarOptions`

The exported table of every allowed value for each style and trait — the canonical source for building pickers or validating input.

```js
import { avatarOptions } from 'cast-avatar';

avatarOptions.style;     // ['portrait', 'cartoon', 'minimal', 'line', ...]
avatarOptions.hairStyle; // ['none', 'stubble', 'short', 'long', ...]
```

### `createAvatars(items, sharedOptions)` and `createAvatarSprite(items, options)`

Render a roster in one call. `createAvatars` returns an array of SVG strings;
`createAvatarSprite` packs them into a single SVG grid (handy for previewing a
fleet of agents). Each item is a seed or an options object.

```js
import { createAvatars, createAvatarSprite } from 'cast-avatar';

const avatars = createAvatars(['agent-1', 'agent-2'], { style: 'line' });
const sheet = createAvatarSprite(agentIds, { columns: 8, cell: 64, style: 'bot' });
```

### `createAvatarGroup(seeds, options)` and `mergeSeeds(...seeds)`

`createAvatarGroup` composes several member seeds into **one cohesive mark** — a
clipped mosaic (1–4 tiles), with extra members collapsing into a `+N` chip.
Great for a team channel, an agent squad, or a group DM icon. `mergeSeeds`
combines seeds into a single deterministic, **order-independent** seed for a
stable "pair"/relationship avatar.

```js
import { createAvatarGroup, mergeSeeds, createAvatar } from 'cast-avatar';

const team = createAvatarGroup(['ada', 'grace', 'lin', 'noor', 'kai'], { style: 'portrait' });
// '+1' chip for the 5th member; pass { max: 4 } to tune the cap.

// Members can also be objects with per-member overrides:
const squad = createAvatarGroup([
  'ada',
  { seed: 'grace', style: 'bot' },
  { seed: 'lin', traits: { skinTone: 'dark' } },
], { style: 'portrait' });

const pair = createAvatar(mergeSeeds('alice', 'bob')); // same avatar regardless of order
```

## Custom palettes

Pass a `palette` to theme avatars to your own colors. Tone maps
(`skinTones`/`hairColors`) merge over the defaults; color lists
(`backgrounds`, `shapeColors`, `clothingColors`, `inks`) replace them. The
result stays fully deterministic, and the palette is preserved through
`encodeAvatar`/`decodeAvatar`.

```js
const brand = {
  backgrounds: ['#0f172a', '#1e293b'],
  shapeColors: ['#22d3ee', '#a78bfa', '#f472b6'],
  clothingColors: ['#0ea5e9', '#6366f1'],
};

createAvatar('agent-7', { style: 'shapes', palette: brand });
```

For a built-in **colorblind-safe** option, pass the preset name instead of an
object. It uses the Okabe–Ito palette (distinguishable across common color-vision
deficiencies) for the abstract styles, clothing, and inks, while leaving skin and
hair tones natural:

```js
createAvatar('agent-7', { style: 'shapes', palette: 'accessible' });
```

The preset is also exported (`COLORBLIND_SAFE_PALETTE`, `PALETTE_PRESETS`) if you
want to extend or compose it, and `resolvePalette(override)` resolves an object or
preset name into a full color set.

## Accessibility

Every avatar renders as an accessible image: `role="img"` with an `aria-label`
and a native `<title>` (defaulting to `` `${seed} avatar` ``). Set a meaningful
`title` when the seed isn't human-friendly:

```js
createAvatar('u_8f3a1', { title: 'Ada Lovelace' });
```

When an avatar sits next to text that already names the person, mark it
`decorative` so assistive tech skips it (it renders `aria-hidden="true"` with no
role, label, or title):

```js
createAvatar('u_8f3a1', { decorative: true });
```

For color-vision accessibility, use `palette: 'accessible'` (see
[Custom palettes](#custom-palettes)). The `status` badge otherwise conveys state
through color and corner position alone — add `status: { state, icon: true }` for
a shape glyph so it's distinguishable without color, and pair it with visible
text where presence is important.

## Expressions

`expression` is a shorthand that presets the expressive traits
(`eyes` + `mouth` + `eyebrows`) **while leaving identity traits seed-derived** —
so the *same* avatar can change mood without becoming a different person. It's
ideal for reflecting user or agent state (idle, thinking, done, error). Explicit
`traits` still take precedence over an expression, and it applies to the face
styles (`portrait`, `studio`, `cartoon`, `minimal`, `line`).

```js
createAvatar('agent-7', { expression: 'thinking' });  // same agent, pensive
createAvatar('agent-7', { expression: 'happy' });      // same agent, pleased
// per-trait overrides still win:
createAvatar('agent-7', { expression: 'happy', traits: { eyes: 'wink' } });
```

Values: `neutral`, `happy`, `sad`, `surprised`, `thinking`, `wink`.

## Web component

A zero-dependency `<cast-avatar>` custom element is available from the
`cast-avatar/element` entry point. Importing the module registers the element.

```html
<script type="module">
  import 'cast-avatar/element';
</script>

<cast-avatar seed="ada@example.com" variant="face" size="96"></cast-avatar>
```

Attributes: `seed`, `variant` (the style name — `style` is reserved by HTML),
`size`, and `background`. The element re-renders when any of these change. For
full trait control, render with the JavaScript API instead.

## Options

| Option | Values |
| --- | --- |
| `seed` | Any stable string, such as a user ID, email, or username. `name` and `id` are accepted as aliases. |
| `style` | `portrait` (default), `studio`, `cartoon`, `minimal`, `line`, `pixel`, `initials`, `bot`, `shapes`, `mesh`; or `auto` for a seed-random style. `face` is a legacy alias for `cartoon`. |
| `expression` | `neutral`, `happy`, `sad`, `surprised`, `thinking`, `wink` — presets the expressive traits while keeping identity stable. See [Expressions](#expressions). |
| `size` | Pixel size from `24` to `1024`; defaults to `128`. |
| `background` | Any CSS color, `transparent`, a seeded `gradient`, a seeded pattern (`dots`, `rings`, `grid`), or `auto`. |
| `radius` | SVG corner radius — a number (px) or CSS length; defaults to `50%` (circle). |
| `title` | Accessible label (and `<title>` tooltip) for the SVG; defaults to `"<seed> avatar"`. |
| `decorative` | When `true`, hide the SVG from assistive tech (`aria-hidden`, no role/label/title). Defaults to `false`. See [Accessibility](#accessibility). |
| `initials` | Optional text override for the `initials` style. |
| `status` | Presence badge. A state string (`online`/`busy`/`away`/`offline`) for a corner dot, or an object `{ state, shape: 'dot'\|'ring', position, pulse, icon }` for a ring border, custom placement/animation, or a colorblind-safe shape glyph (`icon: true`). Omitted = none. Applies to every style. |
| `animate` | A subtle looping animation: `breathe`, `bounce`, or `blink` (eye-blink, face styles only). Respects `prefers-reduced-motion`. Works on every style. |
| `palette` | Override the default color sets (object), or a preset name (`'accessible'` / `'colorblind-safe'`) — see [Custom palettes](#custom-palettes). |
| `fontWeight` | Monogram font weight for the `initials` style (default `800`). |
| `fontFamily` | Monogram font family for the `initials` style. |
| `traits` | Object of per-feature traits; see below. |

For the `initials` style, set `radius: 0` for a square monogram tile or keep the
default `50%` for a circle, and use `fontWeight`/`fontFamily` to restyle the text.

The styles are deterministic from the seed. `portrait` (the default), `studio`,
`cartoon`, `minimal`, `line`, and `pixel` use the trait set below — `portrait`
is a refined illustrative face, `studio` a semi-realistic, sculpted portrait of
the same person (a faceShape-driven head, multi-layer skin modelling, a sculpted
nose, volumetric lips, and lidded eyes), `cartoon` a playful one (formerly
`face`), `minimal` a flat geometric one, and `line` a monochrome thin-line one.
`initials` renders a monogram, and `bot`/`shapes`/`mesh` derive their colors and
composition from the seed alone (`mesh` is an abstract gradient-blob style).

Not every trait applies to every style: the illustrative faces (`portrait`,
`studio`, `cartoon`) honour the full set; `minimal` and `line` render a
style-appropriate subset (and `line`, being monochrome, ignores colour traits);
and `pixel`/`initials`/`bot`/`shapes`/`mesh` derive everything from the seed and
ignore face traits. The playground only shows the controls a given style uses.

## Trait options

Traits live under the `traits` key. Every trait also accepts `auto` (the
default), which deterministically chooses a value from the seed. Each trait is
drawn from its own seed-derived stream, so setting one trait never changes the
auto-generated value of another.

| Trait | Values |
| --- | --- |
| `gender` | `neutral`, `feminine`, `masculine`. |
| `skinTone` | `light`, `mediumLight`, `medium`, `mediumDark`, `dark`. |
| `faceShape` | `round`, `oval`, `soft`. |
| `hairStyle` | `none`, `stubble`, `short`, `long`, `curly`, `coily`, `bun`, `afro`, `mohawk`, `spiky`, `hijab`. |
| `hairColor` | `black`, `brown`, `blonde`, `red`, `gray`, `white`. |
| `eyebrows` | `flat`, `raised`, `angled`. |
| `eyes` | `round`, `smile`, `sleepy`, `wink`. |
| `nose` | `soft`, `button`, `wide`. |
| `mouth` | `smile`, `neutral`, `open`. |
| `facialHair` | `none`, `stubble`, `mustache`, `goatee`, `beard`, `fullBeard`, `sideburns`. |
| `freckles` | `none`, `light`, `heavy`. |
| `blush` | `none`, `soft`. |
| `headwear` | `none`, `beanie`, `cap`, `turban`, `bucket`, `hijab`. |
| `earrings` | `none`, `studs`, `hoops`. |
| `accessories` | `none`, `glasses`, `sunglasses`. |
| `clothing` | Any CSS color or `auto`; colors the shoulders/collar in the face styles. The one free-color trait. |

The `face` style uses every trait. The `pixel` style derives a comparable
character (skin, hair, hat, glasses, beard) from the seed. A `hijab` hairstyle
implies `hijab` headwear unless you set a different `headwear` explicitly.

The legacy top-level `hair` and `clothing` options are still accepted as aliases for `traits.hairStyle` and `traits.clothing`.

The complete, machine-readable list of every allowed value lives in the
exported `avatarOptions` table — see below.

## Edge & server rendering

`createAvatar` — and `createAvatars`, `createAvatarSprite`, `createAvatarDataUri`,
`avatarHash`, `encodeAvatar` — are pure string functions with **no DOM or Node
APIs**, so they run anywhere: Node, Deno, Bun, Cloudflare Workers, and Vercel /
Netlify Edge. And because Cast is dependency-free, there's nothing to bundle.

```js
// Cloudflare Workers / any fetch handler
import { createAvatar } from 'cast-avatar';

export default {
  fetch(request) {
    const seed = new URL(request.url).searchParams.get('seed') || 'cast';
    const svg = createAvatar(seed, { style: 'portrait' });
    return new Response(svg, {
      headers: {
        'content-type': 'image/svg+xml; charset=utf-8',
        'cache-control': 'public, max-age=31536000, immutable',
      },
    });
  },
};
```

For **Open Graph / social images**, use the avatar SVG (or its data-URI from
`createAvatarDataUri`) directly as `og:image`, or rasterize it to PNG at the
edge. The output is deterministic, so a CDN can cache it forever.

(`createAvatarElement` and `mountAvatar` are the only DOM-bound helpers — not
needed for edge/SSR.)

## Stability and versioning

Avatars are deterministic: the **same seed and options always produce the same
SVG for a given version of `cast-avatar`**. Because each trait is drawn from its
own seed-derived stream, rendering at any `size` yields the same character —
just scaled.

Across versions, the *visual output for a given seed can change* — adding a
hairstyle, adjusting a palette, or refining how a feature is drawn all shift
what `auto` resolves to or how it is rendered. This project treats a visual
change to an existing seed as a breaking change (a major version bump). If you
need an avatar to stay identical over time, pick a guarantee level:

| Need | Persist | Render with |
| --- | --- | --- |
| Stable while you control the version | the seed (e.g. an agent/user id) | `createAvatar(seed)` — pin the exact version |
| Survive library upgrades | `encodeAvatar(seed, options)` | `createAvatar(decodeAvatar(stored))` |
| Pixel-locked forever | the rendered SVG string | use it directly |

`avatarHash()` is a one-way lookup/cache key. It cannot regenerate an avatar and
it changes whenever any option (including `size` or `background`) changes, so
don't use it as your identity anchor — persist the seed (or one of the artifacts
above) instead.

## Demo

Try the hosted demo at **[go4cas.github.io/cast](https://go4cas.github.io/cast/)**,
or run it locally: open `index.html` in a browser (serve it over HTTP so the ES
module imports resolve — e.g. `npx serve` or `python3 -m http.server`). It needs
no build step.

The demo includes:

- A large live preview with controls for every `face` trait plus size, background, and clothing.
- A **Randomize** button, **Copy SVG** / **Copy data-URI** / **Download PNG** buttons, and a **Copy link** button.
- A shareable URL: the current avatar is encoded into the page's URL hash, so any link reproduces the exact avatar.
- A fixed-seed variation gallery for the `face`, `portrait`, `minimal`, `line`, `initials`, `shapes`, `pixel`, `bot`, and `mesh` styles.

### Team Builder

The **[Team Builder](https://go4cas.github.io/cast/team.html)** (`team.html`) turns a
pasted list of identifiers — names, emails, or IDs, with optional labels — into a
whole set of avatars at once. Style the team, customize individuals (style,
expression, status, and full identity traits), reorder or remove tiles, and
import a roster from CSV. Export the result as a ZIP of SVGs or PNGs, a sprite
sheet, a group mark, a `createAvatars` snippet, or a shareable link. Like the
rest of the demo it's a single static file with no build step.

## Development

Run the test suite with:

```sh
npm test
```

## Credits

Cast Avatar was inspired by [DiceBear](https://www.dicebear.com/) — its
seed-driven, multi-style approach to avatars shaped this project's design, and
the `pixel` and `bot` styles in particular take cues from DiceBear's catalog.
All of Cast Avatar's artwork is original and procedurally generated; no DiceBear
assets are bundled or copied.
