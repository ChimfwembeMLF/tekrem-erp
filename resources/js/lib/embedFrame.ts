/** Helpers for same-origin iframe embeds (ticket + chat widgets). */
export const embedFrameEl =
  typeof window !== 'undefined'
    ? (window.frameElement as HTMLIFrameElement | null)
    : null;

export function lockEmbedFrame(): void {
  if (embedFrameEl) {
    embedFrameEl.style.pointerEvents = 'auto';
  }
}

export function unlockEmbedFrame(): void {
  if (embedFrameEl) {
    embedFrameEl.style.pointerEvents = 'none';
  }
}

export function notifyEmbedParent(type: 'open' | 'close'): void {
  if (typeof window !== 'undefined' && window.parent !== window) {
    window.parent.postMessage({ type: `guest-chat-widget-${type}` }, '*');
  }
}
