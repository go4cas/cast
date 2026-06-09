import { createAvatar } from './avatar.js';

// `<cast-avatar seed="ada" variant="face" size="96">` — a zero-dependency
// custom element wrapper around createAvatar. The style name is exposed as the
// `variant` attribute because `style` is a reserved HTML attribute.
//
// Extending a dummy base when HTMLElement is unavailable keeps this module safe
// to import in Node / SSR; the element is only registered in a real DOM.
const Base = typeof HTMLElement !== 'undefined' ? HTMLElement : class {};

export class CastAvatarElement extends Base {
  static get observedAttributes() {
    return ['seed', 'variant', 'size', 'background'];
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

    this.innerHTML = createAvatar(this.getAttribute('seed') || '', options);
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('cast-avatar')) {
  customElements.define('cast-avatar', CastAvatarElement);
}
