// Type declarations for the talking-avatar helper (cast-avatar/speak).

/** Options forwarded to the underlying SpeechSynthesisUtterance. */
export interface SpeakOptions {
  voice?: SpeechSynthesisVoice;
  /** Speed, 0.1–10 (default 1). */
  rate?: number;
  /** Pitch, 0–2 (default 1). */
  pitch?: number;
  /** Volume, 0–1 (default 1). */
  volume?: number;
  /** BCP-47 language tag, e.g. `'en-GB'`. */
  lang?: string;
}

/** An avatar `<svg>`, a `<cast-avatar>`, the `.cast-mouth` group, or a container of one. */
export type SpeakTarget = Element | null | undefined;

/** Resolve a target to its `.cast-mouth` group, or `null` if absent. */
export function findMouth(target: SpeakTarget): Element | null;

/**
 * Speak `text` aloud and flap the avatar's mouth while it plays. The avatar must
 * be rendered with `animate: 'talk'` for the mouth to move. Resolves when speech
 * ends, rejects on a speech error. Outside a speech-capable browser (Node/SSR)
 * it resolves immediately as a no-op. Respects `prefers-reduced-motion` (speaks
 * the audio but skips mouth movement).
 */
export function speak(target: SpeakTarget, text: string, opts?: SpeakOptions): Promise<void>;

/** Cancel any in-flight speech and rest the avatar's mouth. */
export function stopSpeaking(target?: SpeakTarget): void;
