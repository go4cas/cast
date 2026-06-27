// Make an avatar talk out loud. An opt-in companion to the pure-SVG core (like
// ./element): it drives the mouth of an avatar rendered with `animate: 'talk'`
// from the browser's native speech engine (Web Speech API) — no dependency.
//
// SSR-safe: with no `window`/`speechSynthesis` (Node, SSR) `speak()` resolves
// immediately and `stopSpeaking()` is a no-op, so importing it never throws.

// Resolve a caller's target to the `.cast-mouth` group the face renderers emit
// under `animate: 'talk'`. Accepts the group itself, the avatar's <svg>, a
// <cast-avatar>, or any container that wraps one.
export function findMouth(target) {
  if (!target) {
    return null;
  }
  if (target.classList && target.classList.contains('cast-mouth')) {
    return target;
  }
  return typeof target.querySelector === 'function' ? target.querySelector('.cast-mouth') : null;
}

function speechAvailable() {
  return typeof window !== 'undefined' && !!window.speechSynthesis;
}

function reducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Speak `text` and flap the avatar's mouth while it plays. Resolves when speech
// ends, rejects on a speech error. `opts` (voice/rate/pitch/volume/lang) pass
// straight through to the utterance.
export function speak(target, text, opts = {}) {
  if (!speechAvailable()) {
    return Promise.resolve();
  }

  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text == null ? '' : String(text));
  for (const key of ['voice', 'rate', 'pitch', 'volume', 'lang']) {
    if (opts[key] != null) {
      utter[key] = opts[key];
    }
  }

  // Skip mouth motion under prefers-reduced-motion — still speak the audio.
  const mouth = reducedMotion() ? null : findMouth(target);
  let timer = 0;
  let open = false;

  // A timer flap, not the per-word `boundary` event: boundary support is patchy
  // across voices/browsers, so a steady 140ms toggle reads as talking everywhere.
  // ponytail: fixed cadence; switch to boundary-driven visemes if lip-sync fidelity matters.
  const startFlap = () => {
    if (!mouth) {
      return;
    }
    // Cancel Tier 1's idle CSS loop so our inline transform wins — a CSS
    // animation (even paused) overrides inline styles, so pausing isn't enough.
    // transform-box/origin still come from the stylesheet rule (fill-box/center).
    mouth.style.animation = 'none';
    timer = setInterval(() => {
      open = !open;
      mouth.style.transform = `scaleY(${open ? 1.3 : 0.5})`;
    }, 140);
  };

  const rest = () => {
    if (timer) {
      clearInterval(timer);
      timer = 0;
    }
    if (mouth) {
      mouth.style.transform = '';
      // Leave the idle CSS loop cancelled so the mouth stays still once speech
      // ends — a spoken avatar shouldn't keep flapping on its own.
      mouth.style.animation = 'none';
    }
  };

  return new Promise((resolve, reject) => {
    utter.onstart = startFlap;
    utter.onend = () => { rest(); resolve(); };
    utter.onerror = (event) => {
      rest();
      reject(new Error((event && event.error) || 'speech failed'));
    };
    synth.cancel(); // ponytail: one utterance at a time; cancels any in-flight speech
    synth.speak(utter);
  });
}

// Cancel any in-flight speech and rest the avatar's mouth.
export function stopSpeaking(target) {
  if (speechAvailable()) {
    window.speechSynthesis.cancel();
  }
  const mouth = findMouth(target);
  if (mouth) {
    mouth.style.transform = '';
    mouth.style.animation = 'none';
  }
}
