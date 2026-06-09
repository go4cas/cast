const HASH_OFFSET = 2166136261;
const HASH_PRIME = 16777619;

export function stableStringify(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  return `{${Object.keys(value)
    .sort()
    .filter((key) => value[key] !== undefined)
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(',')}}`;
}

export function hashString(input = '') {
  const text = String(input);
  let hash = HASH_OFFSET;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, HASH_PRIME);
  }

  return hash >>> 0;
}

export function hashConfig(config = {}) {
  return hashString(stableStringify(config)).toString(36).padStart(7, '0');
}

export function createRandom(seed = '') {
  let state = hashString(seed) || 1;

  return function random() {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick(items, random, preferred) {
  if (preferred !== undefined && preferred !== null && items.includes(preferred)) {
    return preferred;
  }

  return items[Math.floor(random() * items.length)];
}


function bytesToBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  const base64 = typeof btoa === 'function'
    ? btoa(binary)
    : globalThis.Buffer.from(binary, 'binary').toString('base64');

  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value) {
  const base64 = String(value).replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(String(value).length / 4) * 4, '=');
  const binary = typeof atob === 'function'
    ? atob(base64)
    : globalThis.Buffer.from(base64, 'base64').toString('binary');

  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export function encodeObject(value) {
  return bytesToBase64Url(new TextEncoder().encode(stableStringify(value)));
}

export function decodeObject(value) {
  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(value)));
}
