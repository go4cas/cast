// Type declarations for the cast-avatar custom element (cast-avatar/element).

/** `<cast-avatar>` custom element. Renders an avatar via createAvatar. */
export class CastAvatarElement extends HTMLElement {
  static readonly observedAttributes: readonly ['seed', 'variant', 'size', 'background'];
  connectedCallback(): void;
  attributeChangedCallback(): void;
  /** Render the avatar into the element from its current attributes. */
  render(): void;
}

declare global {
  interface HTMLElementTagNameMap {
    'cast-avatar': CastAvatarElement;
  }
}

export {};
