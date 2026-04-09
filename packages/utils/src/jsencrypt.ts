import { JSEncrypt } from 'jsencrypt';

function createJSEncrypt() {
  return new JSEncrypt();
}

export function encryptByRsa(text: string, publicKey: string): string | boolean {
  if (!publicKey) return false;

  const encryptor = createJSEncrypt();
  encryptor.setPublicKey(publicKey);
  return encryptor.encrypt(text);
}

export function decryptByRsa(text: string, privateKey: string): string | boolean {
  if (!privateKey) return false;

  const encryptor = createJSEncrypt();
  encryptor.setPrivateKey(privateKey);
  return encryptor.decrypt(text);
}
