/** 文本转 Base64。 */
export function encodeTextToBase64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

/** Base64 转文本。 */
export function decodeBase64ToText(payload: string) {
  const binary = atob(payload);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

/** Base64 转文本，失败返回原文。 */
export function safeDecodeBase64ToText(payload: string) {
  try {
    return decodeBase64ToText(payload);
  } catch {
    return payload;
  }
}

/** JSON 数据转 Base64。 */
export function encodeJsonToBase64(payload: unknown) {
  return encodeTextToBase64(JSON.stringify(payload ?? null));
}
