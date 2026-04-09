export function isClipboardSupported() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  return Boolean(navigator.clipboard?.writeText) || typeof document.execCommand === 'function';
}

function canUseClipboardApi() {
  return typeof window !== 'undefined' && window.isSecureContext && Boolean(navigator.clipboard?.writeText);
}

function fallbackCopyText(text: string) {
  if (typeof document === 'undefined') {
    return false;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.left = '-9999px';

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);

  return copied;
}

export async function copyText(text?: string) {
  if (!text || !isClipboardSupported()) {
    return false;
  }

  if (canUseClipboardApi()) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {}
  }

  return fallbackCopyText(text);
}
