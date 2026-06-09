# Cast Avatar

Cast Avatar is a tiny, dependency-free JavaScript library for creating deterministic SVG avatars without network access. It is inspired by avatar systems that turn a stable seed into repeatable faces, initials, abstract marks, or geometric shapes.

## Goals

- **Offline-first:** no remote images, fonts, APIs, or package dependencies are required.
- **Deterministic:** the same seed and options always generate the same SVG.
- **Persistable:** `avatarHash()` creates a compact lookup key, while `encodeAvatar()` stores the exact resolved avatar configuration.
- **Framework-free:** use it with plain HTML, CSS, and JavaScript.
- **Inclusive traits:** apps can choose or auto-generate skin tone, face shape, hair, eye shape, gender presentation, facial hair, headwear, and accessories.

## Quick start

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

## Options

| Option | Values |
| --- | --- |
| `seed` | Any stable string, such as a user ID, email, or username. |
| `style` | `face`, `initials`, `shapes`, `abstract`. |
| `size` | Pixel size from `24` to `1024`; defaults to `128`. |
| `background` | Any CSS color or `auto`. |
| `radius` | SVG rectangle radius; defaults to `50%`. |
| `title` | Accessible label for the SVG. |
| `initials` | Optional text override for the `initials` style. |

## Trait options

Traits live under the `traits` key. Most traits also accept `auto`, which deterministically chooses a value from the seed.

| Trait | Values |
| --- | --- |
| `gender` | `neutral`, `feminine`, `masculine`. |
| `skinTone` | `light`, `mediumLight`, `medium`, `mediumDark`, `dark`. |
| `faceShape` | `round`, `oval`, `soft`. |
| `hairStyle` | `none`, `short`, `long`, `curly`, `coily`, `bun`, `hijab`. |
| `hairColor` | `black`, `brown`, `blonde`, `red`, `gray`, `white`. |
| `eyes` | `round`, `smile`, `sleepy`, `wink`. |
| `mouth` | `smile`, `neutral`, `open`. |
| `facialHair` | `none`, `mustache`, `beard`. |
| `headwear` | `none`, `beanie`, `hijab`. |
| `accessories` | `none`, `glasses`, `sunglasses`. |

The legacy top-level `hair` option is still accepted as an alias for `traits.hairStyle`.

## Demo

Open `index.html` in a browser. The demo imports `src/avatar.js` directly and does not need a build step.

## Development

Run the test suite with:

```sh
npm test
```
