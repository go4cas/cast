# Cast Avatar

Cast Avatar is a tiny, dependency-free JavaScript library for creating deterministic SVG avatars without network access. It is inspired by avatar systems that turn a stable seed into repeatable faces, initials, or geometric shapes.

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

avatarOptions.style;     // ['face', 'initials', 'shapes', 'pixel', 'bot']
avatarOptions.hairStyle; // ['none', 'stubble', 'short', 'long', ...]
```

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
| `style` | `face`, `initials`, `shapes`, `pixel`, `bot`; or `auto`. |
| `size` | Pixel size from `24` to `1024`; defaults to `128`. |
| `background` | Any CSS color, `transparent`, `gradient` (a seeded two-color gradient), or `auto`. |
| `clothing` | Any CSS color or `auto`; colors the shoulders/collar in the `face` style. |
| `radius` | SVG corner radius — a number (px) or CSS length; defaults to `50%` (circle). |
| `title` | Accessible label for the SVG; defaults to `"<seed> avatar"`. |
| `initials` | Optional text override for the `initials` style. |
| `traits` | Object of per-feature traits; see below. |

The styles are deterministic from the seed: `face` and `pixel` use the trait
set below, `initials` renders a monogram, and `shapes`/`bot` derive their
colors and composition from the seed alone.

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

The `face` style uses every trait. The `pixel` style derives a comparable
character (skin, hair, hat, glasses, beard) from the seed. A `hijab` hairstyle
implies `hijab` headwear unless you set a different `headwear` explicitly.

The legacy top-level `hair` option is still accepted as an alias for `traits.hairStyle`.

The complete, machine-readable list of every allowed value lives in the
exported `avatarOptions` table — see below.

## Demo

Open `index.html` in a browser (serve it over HTTP so the ES module imports
resolve — e.g. `npx serve` or `python3 -m http.server`). It needs no build step.

The demo includes:

- A large live preview with controls for every `face` trait plus size, background, and clothing.
- A **Randomize** button, **Copy SVG** / **Copy data-URI** / **Download PNG** buttons, and a **Copy link** button.
- A shareable URL: the current avatar is encoded into the page's URL hash, so any link reproduces the exact avatar.
- A fixed-seed variation gallery for the `face`, `initials`, `shapes`, `pixel`, and `bot` styles.

## Development

Run the test suite with:

```sh
npm test
```
