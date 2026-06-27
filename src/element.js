import { createAvatar } from './avatar.js';
import { speak } from './speak.js';

// `<cast-avatar seed="ada" variant="face" size="96">` — a zero-dependency
// custom element wrapper around createAvatar. The style name is exposed as the
// `variant` attribute because `style` is a reserved HTML attribute.
//
// Extending a dummy base when HTMLElement is unavailable keeps this module safe
// to import in Node / SSR; the element is only registered in a real DOM.
const Base = typeof HTMLElement !== 'undefined' ? HTMLElement : class {};

export class CastAvatarElement extends Base {
  static get observedAttributes() {
    return ['seed', 'variant', 'size', 'background', 'animate'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  render() {
    const options = {
      style: this.getAttribute('variant') || 'face'
    };

    if (this.hasAttribute('size')) {
      options.size = Number(this.getAttribute('size'));
    }

    if (this.hasAttribute('background')) {
      options.background = this.getAttribute('background');
    }

    if (this.hasAttribute('animate')) {
      options.animate = this.getAttribute('animate');
    }

    this.innerHTML = createAvatar(this.getAttribute('seed') || '', options);
  }

  // Speak `text` aloud, flapping the mouth in time. Requires the avatar to be
  // rendered with `variant`/`animate: 'talk'` so the `.cast-mouth` rig is present.
  speak(text, opts) {
    return speak(this, text, opts);
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('cast-avatar')) {
  customElements.define('cast-avatar', CastAvatarElement);
}
