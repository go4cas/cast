// Type declarations for the cast-avatar custom element (cast-avatar/element).

import type { SpeakOptions } from './speak.js';

/** `<cast-avatar>` custom element. Renders an avatar via createAvatar. */
export class CastAvatarElement extends HTMLElement {
  static readonly observedAttributes: readonly ['seed', 'variant', 'size', 'background', 'animate'];
  connectedCallback(): void;
  attributeChangedCallback(): void;
  /** Render the avatar into the element from its current attributes. */
  render(): void;
  /**
   * Speak `text` aloud, flapping the mouth in time. Requires the element to be
   * rendered with `animate="talk"` so the mouth rig is present. Resolves when
   * speech ends; resolves immediately (no-op) outside a speech-capable browser.
   */
  speak(text: string, opts?: SpeakOptions): Promise<void>;
}

declare global {
  interface HTMLElementTagNameMap {
    'cast-avatar': CastAvatarElement;
  }
}

export {};
